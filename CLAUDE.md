# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**filmotheque-back** is a TypeScript Express.js backend for a personal movie collection database. It integrates with external services (Trakt API for movie search, TMDB for posters) and requires the separate [opensesame](https://github.com/macolmenerori/opensesame) authentication service.

## Architecture & Key Dependencies

### Express 5.x Considerations
- Error handling uses `catchAsync` wrapper with explicit error logging for Express 5.x compatibility

### Core Stack
- **Framework**: Express 5.2.1 + TypeScript
- **Database**: MongoDB with Mongoose 8.x
- **Authentication**: External via opensesame service (Bearer tokens + cookies)
- **Validation**: express-validator with custom validation chains
- **Security**: Helmet, CORS with whitelist, rate limiting
- **External APIs**: Trakt (movie search), TMDB (poster scraping with Cheerio)

### Project Structure
```
src/
├── app.ts              # Express app configuration & middleware
├── server.ts           # Server startup, DB connection, process handlers
├── controllers/        # Business logic (only moviesController.ts)
├── models/             # Mongoose schemas + TypeScript types
├── routes/             # Express routers with middleware chains
├── utils/              # Utilities (catchAsync, env validation, etc.)
└── validations/        # express-validator validation chains
```

## Key Patterns & Conventions

### Authentication Flow
- Uses `protect` middleware that validates JWT tokens via external opensesame service
- Supports both `Authorization: Bearer <token>` and `jwt` cookie
- User info attached to `req.user` after successful auth

### Data Flow Pattern
All routes follow: `Router → Validation → Auth (protect) → Controller → Response`

### Movie Model Schema
Core fields: `user`, `id`, `title`, `year`, `length`, `media[]`, `size`, `watched`, `backedUp`, `backupDate`, `meta_ids{}`, `poster_url`

### API Endpoints (`/api/v1/movies/`)
- `GET /searchmovie` - Search Trakt API for movies
- `GET|POST|PATCH|DELETE /movie` - CRUD operations on user's movie collection
- `GET /fullmovie` - Get single movie details
- `GET /exportuserdata` - Export user's collection as JSON
- `POST /importuserdata` - Import collection from JSON file (uses multer)

## Environment Configuration

### Required Environment Variables
All validated in `checkEnvVars.ts`:
- `NODE_ENV`, `PORT`, `DATABASE` (MongoDB connection)
- `AUTH_URL` (opensesame service URL)
- `TRAKT_API_URL`, `TRAKT_CLIENT_ID`, `TRAKT_CLIENT_SECRET`
- `TMDB_BASE_URL` (for poster scraping)
- `RATELIMIT_MAXCONNECTIONS`, `RATELIMIT_WINDOWMS`
- `CORS_WHITELIST` (comma-separated domains)

## Development Commands

- `pnpm dev` - Development server with nodemon
- `pnpm build` - TypeScript compilation to `/dist`
- `pnpm verify` - Full verification: audit + lint + prettify + types + build
- `pnpm types` - TypeScript check without emit
- `pnpm lint` - ESLint with auto-fix
- `pnpm prettify` - Prettier formatting

## Important Implementation Details

### Error Handling
- `catchAsync` wrapper for all async route handlers
- Explicit error logging with 500 responses for caught errors
- Global error handlers for uncaught exceptions and unhandled rejections

### Security Measures
- CORS whitelist validation
- Rate limiting (default: 100 requests/hour per IP)
- Request size limits (1MB JSON, 10KB URL-encoded)
- NoSQL injection protection via @exortek/express-mongo-sanitize
- Helmet security headers (CSP disabled)

### Database Patterns
- All movie operations scoped to authenticated user
- Pagination, filtering (watched/backedUp), and sorting support
- Unique movie IDs with auto-generation fallback

### External Service Integration
- Trakt API for movie search with error handling
- TMDB poster scraping using Cheerio HTML parsing
- Graceful degradation when external services fail

## Development Notes

- Node.js >= 24.0.0 required
- Uses pnpm (v10.24.0) for package management
- TypeScript strict mode enabled
- ESLint configured with Airbnb + TypeScript rules
- Prettier integration with import sorting
- OpenAPI documentation available in `/docs/openapi.yml`