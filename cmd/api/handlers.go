package main

import (
	"errors"
	"log"
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

	// Generate JWT user
	u := jwtUser{
		ID:        1,      // This should be replaced with the actual user ID from the database
		FirstName: "John", // Replace with actual first name
		LastName:  "Doe",  // Replace with actual last name
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

	log.Println(tokens.Token)

	refreshCookie := app.auth.GetRefreshCookie(tokens.RefreshToken)

	// Set the refresh token cookie in the response
	http.SetCookie(w, refreshCookie)

	// Write the token pair to the response
	_, err = w.Write([]byte(tokens.Token))
	if err != nil {
		return
	}
}
