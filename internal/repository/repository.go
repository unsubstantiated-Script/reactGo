package repository

import "reactGo/internal/models"

type DatabaseRepo interface {
	AllMovies() ([]*models.Movie, error)
}
