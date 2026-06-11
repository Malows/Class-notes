## Context

The decision has been made to migrate from a Go backend + SvelteKit frontend architecture to a full SvelteKit monorepo. This addresses previous complexities with inter-service communication, proxying, and dual-language development. The core challenge is porting Go backend logic to TypeScript within SvelteKit's server-side capabilities.

## Goals / Non-Goals

**Goals:**

- All existing API functionality from the Go backend is replicated in SvelteKit Route Handlers.
- The `class-notes.db` SQLite database is accessed and managed from SvelteKit's Node.js environment.
- TypeScript types and Zod schemas are shared effectively across client and server logic within SvelteKit.
- A single Docker image builds and runs the entire SvelteKit application.
- `docker-compose.yaml` provides a simple way to run the application and its dependencies (e.g., database).

**Non-Goals:**

- Significant changes to the application's core features or UI beyond adapting to the new backend.
- Migrating the database schema itself (only the access layer changes).
- Implementing complex authentication/authorization mechanisms (beyond current scope).

## Decisions

- **API Implementation**: Use SvelteKit's `+server.ts` files for all API endpoints. These will handle incoming requests, interact with the database, and return JSON responses.
- **Database Access Layer**:
  - Use `better-sqlite3` for direct SQLite access from Node.js.
  - Create a dedicated database service (`src/lib/server/db.ts`) for managing connections and executing queries.
  - Implement a simple repository pattern (`src/lib/server/repositories/`) mirroring the Go repositories.
- **Data Transfer Objects (DTOs) & Validation**:
  - Re-use and enhance existing TypeScript types (`src/lib/types.ts`).
  - Define Zod schemas (`src/lib/schemas/`) for request validation in Route Handlers.
- **Project Structure**:
  - Backend logic (Route Handlers, DB access, repositories) will reside in `src/routes/api/v1/` and `src/lib/server/`.
  - Shared types/schemas will be in `src/lib/`.
- **Deployment**:
  - **Docker**: A multi-stage `Dockerfile` will build the SvelteKit application for production.
  - **Docker Compose**: A `docker-compose.yaml` will orchestrate the SvelteKit service and potentially a persistent volume for the SQLite database.

## Risks / Trade-offs

- **Risk**: Rewriting Go logic into TypeScript might introduce subtle bugs or performance regressions if not carefully managed.
  - **Mitigation**: Thorough unit and integration testing of the new SvelteKit API. Gradual migration if possible (not applicable here as it's a full rewrite).
- **Risk**: `better-sqlite3` is synchronous. While performant for many use cases, heavy concurrent access might become a bottleneck.
  - **Mitigation**: Monitor performance. If necessary, explore async alternatives (e.g., `sqlite` package with `sqlite3` driver) or optimize queries.
- **Trade-off**: Loss of Go's type safety and concurrency model for backend logic.
  - **Mitigation**: Extensive use of TypeScript, Zod for validation, and adherence to SvelteKit's best practices for server-side code.
- **Risk**: Database file path in Docker environment.
  - **Mitigation**: Use a Docker volume for `class-notes.db` to ensure persistence and easy management.
