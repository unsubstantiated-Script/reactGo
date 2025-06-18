# reactGo

A full-stack web application starter using a Go backend and a React frontend.

## Features

- GoLang backend (REST API)
- React frontend (with npm)
- SQL database integration
- Modular project structure

## Getting Started

### Prerequisites

- Go (1.18+)
- Node.js & npm

### Database Setup

1. Create a PostgreSQL database named `reactgo`.
2. Create a `.env` file in the root directory with the following content:
3. ```env
    DB_PORT=5432
    DB_USERNAME=<your_db_username>
    DB_PASSWORD=<your_db_password>
    DB_NAME=<your_db_name>
    JWT_SECRET=<your_jwt_secret>
    API_KEY_MOVIES=<your_api_key_for_imdb_movies>
    ```
4. Run the following command to create the database schema in a Docker container:
   ```
   docker-compose up -d
5. Manage DB with your preferred tool (e.g., pgAdmin, DBeaver).

### Backend Setup

```

go run ./cmd/api

```

backend will run on `http://localhost:8080`

### Frontend Setup

```

npm install
npm start

```

navigate to `http://localhost:3000` in your browser.