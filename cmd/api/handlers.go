package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"reactGo/internal/models"
	"time"
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

	// Set the content type header to application/json
	out, err := json.Marshal(payload)
	if err != nil {
		fmt.Println(err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, err = w.Write(out)

	if err != nil {
		fmt.Println(err)
	}
}

func (app *application) AllMovies(w http.ResponseWriter, r *http.Request) {
	var movies []models.Movie

	rd, _ := time.Parse("2006-01-02", "1985-03-07")

	highlander := models.Movie{
		ID:          1,
		Title:       "Highlander",
		Year:        1985,
		ReleaseDate: rd,
		RunTime:     116,
		MPAARating:  "R",
		Description: "A story about immortals who can only die by beheading.",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	rd, _ = time.Parse("2006-01-02", "1989-10-27")

	punisher := models.Movie{
		ID:          2,
		Title:       "Punisher",
		Year:        1989,
		ReleaseDate: rd,
		RunTime:     120,
		MPAARating:  "R",
		Description: "A story about a former cop who becomes a vigilante.",
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	movies = append(movies, highlander)
	movies = append(movies, punisher)

	// Set the content type header to application/json
	out, err := json.Marshal(movies)
	if err != nil {
		fmt.Println(err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, err = w.Write(out)

	if err != nil {
		fmt.Println(err)
	}
}
