package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v4"
	"io"
	"log"
	"net/http"
	"net/url"
	"reactGo/internal/models"
	"strconv"
)

func (app *application) Home(w http.ResponseWriter, r *http.Request) {
	var payload = struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Version string `json:"version"`
	}{
		Status:  "active",
		Message: "Go Movies API is running",
		Version: "1.0.0",
	}

	_ = app.writeJSON(w, http.StatusOK, payload)
}

func (app *application) AllMovies(w http.ResponseWriter, r *http.Request) {

	movies, err := app.DB.AllMovies()
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	_ = app.writeJSON(w, http.StatusOK, movies)
}

func (app *application) Authenticate(w http.ResponseWriter, r *http.Request) {
	// Read the json body from the request
	var requestPayload struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	err := app.readJSON(w, r, &requestPayload)
	if err != nil {
		err = app.errorJSON(w, err, http.StatusBadRequest)
		if err != nil {
			return
		}
		return
	}

	// Validate the user credentials
	user, err := app.DB.GetUserByEmail(requestPayload.Email)
	if err != nil {
		err = app.errorJSON(w, errors.New("invalid credentials"), http.StatusBadRequest)
		if err != nil {
			return
		}
		return
	}

	// Check Password
	valid, err := user.PasswordMatches(requestPayload.Password)
	if err != nil || !valid {
		err = app.errorJSON(w, errors.New("invalid credentials"), http.StatusBadRequest)
		if err != nil {
			return
		}
		return
	}

	// Generate JWT user
	u := jwtUser{
		ID:        user.ID,        // This should be replaced with the actual user ID from the database
		FirstName: user.FirstName, // Replace with actual first name
		LastName:  user.LastName,  // Replace with actual last name
	}

	// Generate token pair
	tokens, err := app.auth.GenerateTokenPair(&u)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	refreshCookie := app.auth.GetRefreshCookie(tokens.RefreshToken)

	// Set the refresh token cookie in the response
	http.SetCookie(w, refreshCookie)

	// Write the token pair to the response
	err = app.writeJSON(w, http.StatusAccepted, tokens)
	if err != nil {
		return
	}
}

func (app *application) refreshToken(w http.ResponseWriter, r *http.Request) {
	// Get the refresh token from the cookie
	for _, cookie := range r.Cookies() {
		if cookie.Name == app.auth.CookieName {
			claims := &Claims{}
			refreshToken := cookie.Value

			// Try and parse the token to get the claims.
			_, err := jwt.ParseWithClaims(refreshToken, claims, func(token *jwt.Token) (interface{}, error) {
				return []byte(app.JWTSecret), nil
			})

			if err != nil {
				err := app.errorJSON(w, errors.New("unauthorized"), http.StatusUnauthorized)
				if err != nil {
					return
				}
			}

			// Try and get the user ID from the claims
			userID, err := strconv.Atoi(claims.Subject)
			if err != nil {
				err = app.errorJSON(w, errors.New("unknown user"), http.StatusUnauthorized)
				if err != nil {
					return
				}
			}

			user, err := app.DB.GetUserByID(userID)
			if err != nil {
				err = app.errorJSON(w, errors.New("unknown user"), http.StatusUnauthorized)
				if err != nil {
					return
				}
			}

			u := jwtUser{
				ID:        user.ID,
				FirstName: user.FirstName,
				LastName:  user.LastName,
			}

			tokenPairs, err := app.auth.GenerateTokenPair(&u)
			if err != nil {
				err = app.errorJSON(w, errors.New("error generating tokens"), http.StatusUnauthorized)
				if err != nil {
					return
				}
			}

			http.SetCookie(w, app.auth.GetRefreshCookie(tokenPairs.RefreshToken))

			err = app.writeJSON(w, http.StatusOK, tokenPairs)
			if err != nil {
				return
			}
		}
	}
}

func (app *application) logout(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, app.auth.GetExpiredRefreshCookie())
	w.WriteHeader(http.StatusAccepted)
}

func (app *application) MovieCatalog(w http.ResponseWriter, r *http.Request) {
	movies, err := app.DB.AllMovies()
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	_ = app.writeJSON(w, http.StatusOK, movies)
}

func (app *application) GetMovie(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	movieID, err := strconv.Atoi(id)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	movie, err := app.DB.OneMovie(movieID)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	_ = app.writeJSON(w, http.StatusOK, movie)

}

func (app *application) MovieForEdit(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	movieID, err := strconv.Atoi(id)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	movie, genres, err := app.DB.OneMovieForEdit(movieID)
	if err != nil {
		app.errorJSON(w, err)
		return
	}

	var payload = struct {
		Movie  *models.Movie   `json:"movie"`
		Genres []*models.Genre `json:"genres"`
	}{
		movie,
		genres,
	}

	_ = app.writeJSON(w, http.StatusOK, payload)
}

func (app *application) AllGenres(w http.ResponseWriter, r *http.Request) {
	genres, err := app.DB.AllGenres()
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	_ = app.writeJSON(w, http.StatusOK, genres)

}

func (app *application) InsertMovie(w http.ResponseWriter, r *http.Request) {
	var movie models.Movie

	err := app.readJSON(w, r, &movie)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	movie = app.getPoster(movie)

	newID, err := app.DB.InsertMovie(&movie)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	err = app.DB.UpdateMovieGenres(newID, movie.GenresArray)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	resp := JSONResponse{
		Error:   false,
		Message: "Movie updated",
	}
	app.writeJSON(w, http.StatusAccepted, resp)
}

func (app *application) getPoster(movie models.Movie) models.Movie {
	type TheMovieDB struct {
		Page    int `json:"page"`
		Results []struct {
			PosterPath string `json:"poster_path"`
		} `json:"results"`
		TotalPages int `json:"total_pages"`
	}

	client := &http.Client{}
	theUrl := fmt.Sprintf("https://api.themoviedb.org/3/search/movie?api_key=%s&query=%s", app.APIKey, url.QueryEscape(movie.Title))
	req, err := http.NewRequest("GET", theUrl, nil)
	if err != nil {
		log.Println(err)
		return movie
	}

	req.Header.Add("Accept", "application/json")
	req.Header.Add("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		log.Println(err)
		return movie
	}

	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		return movie
	}

	var responseObj TheMovieDB

	err = json.Unmarshal(bodyBytes, &responseObj)
	if err != nil {
		return models.Movie{}
	}

	// If there are results, set the movie image to the first result's poster path
	if len(responseObj.Results) > 0 {
		movie.Image = responseObj.Results[0].PosterPath
	}

	return movie
}

func (app *application) UpdateMovie(w http.ResponseWriter, r *http.Request) {
	var payload models.Movie

	err := app.readJSON(w, r, &payload)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	movie, err := app.DB.OneMovie(payload.ID)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	movie.Title = payload.Title
	movie.Description = payload.Description
	movie.ReleaseDate = payload.ReleaseDate
	movie.RunTime = payload.RunTime
	movie.MPAARating = payload.MPAARating
	movie.Image = payload.Image

	err = app.DB.UpdateMovie(movie)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	err = app.DB.UpdateMovieGenres(movie.ID, payload.GenresArray)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	resp := JSONResponse{
		Error:   false,
		Message: "Movie updated",
	}

	app.writeJSON(w, http.StatusAccepted, resp)

}

func (app *application) DeleteMovie(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}
	err = app.DB.DeleteMovie(id)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}
	resp := JSONResponse{
		Error:   false,
		Message: "Movie deleted",
	}

	app.writeJSON(w, http.StatusAccepted, resp)
}

func (app *application) AllMoviesByGenre(w http.ResponseWriter, r *http.Request) {
	genreID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	movies, err := app.DB.AllMovies(genreID)
	if err != nil {
		err = app.errorJSON(w, err)
		if err != nil {
			return
		}
		return
	}

	_ = app.writeJSON(w, http.StatusOK, movies)

}
