package main

import (
	"fmt"
	"log"
	"net/http"
)

const port = 8080

type application struct {
	Domain string
}

func main() {
	// Set app config
	var app application

	// read from  CLI
	// connect to DB

	app.Domain = "example.com"

	log.Printf("Starting server on port %d", port)

	// Starting up; the server.
	err := http.ListenAndServe(fmt.Sprintf(":%d", port), app.routes())
	if err != nil {
		log.Fatal(fmt.Sprintf("Error starting server: %v\n", err))
	}

}
