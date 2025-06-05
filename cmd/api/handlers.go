package main

import (
	"errors"
	"net/http"
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
