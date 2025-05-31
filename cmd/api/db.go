package main

import (
	"database/sql"
	_ "github.com/jackc/pgconn"
	_ "github.com/jackc/pgx/v4"
	_ "github.com/jackc/pgx/v4/stdlib"
	"log"
)

func openDB(dsn string) (*sql.DB, error) {
	// Open a new database connection using the provided DSN.
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}

	// Verify the connection to the database.
	if err := db.Ping(); err != nil {
		return nil, err
	}

	return db, nil
}

func (app *application) connectToDB() (*sql.DB, error) {
	connection, err := openDB(app.DSN)

	if err != nil {
		return nil, err
	}

	log.Println("Connected to database")
	return connection, nil
}
