package main

import (
	"database/sql"
	"flag"
	"fmt"
	"github.com/joho/godotenv"
	"log"
	"net/http"
	"os"
)

const port = 8080

type application struct {
	DSN    string
	Domain string
	DB     *sql.DB
}

func main() {
	// Set app config
	var app application

	_ = godotenv.Load(".env")
	// Read environment variables
	dsn := fmt.Sprintf("host=localhost port=%s user=%s password=%s dbname=%s sslmode=disable timezone=UTC connect_timeout=5",
		os.Getenv("DB_PORT"),
		os.Getenv("DB_USERNAME"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
	)

	// read from  CLI
	flag.StringVar(&app.DSN, "dsn", dsn, "Postgres connection string")
	flag.Parse()

	// connect to DB	// connect to DB
	conn, err := app.connectToDB()

	// If the connection is successful, assign it to the app.DB field.
	app.DB = conn

	if err != nil {
		log.Fatal(fmt.Sprintf("Error connecting to database: %v\n", err))
	}

	app.Domain = "example.com"

	log.Printf("Starting server on port %d", port)

	// Starting up; the server.
	err = http.ListenAndServe(fmt.Sprintf(":%d", port), app.routes())
	if err != nil {
		log.Fatal(fmt.Sprintf("Error starting server: %v\n", err))
	}

}
