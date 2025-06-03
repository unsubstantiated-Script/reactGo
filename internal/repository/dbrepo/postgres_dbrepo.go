package dbrepo

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"reactGo/internal/models"
	"time"
)

type PostgresDBRepo struct {
	DB *sql.DB
}

const dbTimeout = time.Second * 3 // seconds

func (m *PostgresDBRepo) Connection() *sql.DB {
	return m.DB
}

func (m *PostgresDBRepo) AllMovies() ([]*models.Movie, error) {
	// This will timeout if the query takes longer than dbTimeout
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `SELECT id, title, description, release_date, runtime, mpaa_rating, coalesce(image, ''), created_at, updated_at 
          FROM movies 
          ORDER BY title ASC`

	rows, err := m.DB.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}

	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			log.Fatal(fmt.Sprintf("Error closing DB rows: %v\n", err))
		}
	}(rows)

	var movies []*models.Movie

	for rows.Next() {
		var movie models.Movie

		err := rows.Scan(
			&movie.ID,
			&movie.Title,
			&movie.Description,
			&movie.ReleaseDate,
			&movie.RunTime,
			&movie.MPAARating,
			&movie.Image,
			&movie.CreatedAt,
			&movie.UpdatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("error scanning row: %w", err)
		}

		movies = append(movies, &movie)
	}

	return movies, nil
}

func (m *PostgresDBRepo) GetUserByEmail(email string) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), dbTimeout)
	defer cancel()

	query := `SELECT id, first_name, last_name, email, password_hash, created_at, updated_at FROM users WHERE email = $1`

	var user models.User

	row := m.DB.QueryRowContext(ctx, query, email)

	err := row.Scan(
		&user.ID,
		&user.FirstName,
		&user.LastName,
		&user.Email,
		&user.Password,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("error scanning user: %w", err)
	}

	return &user, nil
}
