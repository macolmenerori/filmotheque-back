# filmotheque-back

A personal movie collection database, to keep track of the movies we own.

## Requirements

- [opensesame project](https://github.com/macolmenerori/opensesame) set up and running (for authentication)
- [Node JS](https://nodejs.org/en) `>=24.0.0`
- [pnpm](https://pnpm.io/installation)

## API Documentation

The API documentation can be found in openAPI format under `docs/openapi.yml`

## How to set up and run (Demo)

A Docker Compose setup is included to run the **full stack** (MongoDB + auth service + backend + frontend) with a single command, pre-loaded with sample data.

1. Clone the repository:

   ```bash
   git clone https://github.com/macolmenerori/filmotheque-back.git
   cd filmotheque-back/docker
   ```

2. Build and start all services:

   ```bash
   docker compose up --build
   ```

3. Open `http://localhost` and log in with:
   - **Email:** `admin@admin.com`
   - **Password:** `administrator`

The compose stack includes:

| Service             | Port  | Description                   |
| ------------------- | ----- | ----------------------------- |
| `filmotheque-db`    | 27017 | MongoDB with seeded demo data |
| `opensesame-back`   | 8080  | Authentication API            |
| `filmotheque-back`  | 8082  | Filmotheque API               |
| `filmotheque-front` | 80    | Frontend (Nginx)              |

> Sample movies are pre-loaded. To reset the data, run `docker compose down` and start again.

## How to set up and run (Docker)

Easiest way to set up the project to use it right away.

### Steps

1. Set up and run opensesame

```
git clone https://github.com/macolmenerori/opensesame

docker-compose up -d
```

1. Edit the file `config.env.example` with all the parameters, then rename it to `config.env`
2. Generate the Docker image

```
docker build -t filmotheque-back:latest .
```

1. Run the Docker image

```
docker run -p 8081:8081 --name filmotheque-back filmotheque-back
```

## How to set up and run (native)

For feature-testing and development.

### Steps

1. Set up and run [opensesame](https://github.com/macolmenerori/opensesame)
2. Edit the file `config.env.example` with all the parameters, then rename it to `config.env`
3. Install packages `pnpm install`
4. Run the dev environment `pnpm dev`

## Configuration

```
NODE_ENV=production # The environment, leave production for usage
PORT=8081 # Port in which the API will run

DATABASE=mongo_string # mongoDB database connection string
AUTH_URL=http://localhost:8080/api/v1 # opensesame auth URL

TRAKT_API_URL=https://api.trakt.tv # Trakt API URL
TRAKT_CLIENT_ID= # Trakt client ID, generate one in https://trakt.tv/oauth/applications/new
TRAKT_CLIENT_SECRET= # Trakt client secret, generate one in https://trakt.tv/oauth/applications/new

TMDB_BASE_URL=https://www.themoviedb.org/movie # For movie poster

RATELIMIT_MAXCONNECTIONS=100 # Only allow 100 requests from the same IP
RATELIMIT_WINDOWMS=3600000 # Those previous 100 requests must have been in 1 hour

CORS_WHITELIST=http://localhost:8080,http://localhost:8081 # Allowed domains by CORS, comma separated
```
