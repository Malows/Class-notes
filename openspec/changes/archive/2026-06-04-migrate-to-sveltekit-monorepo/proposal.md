## Why

The current architecture involves a separate Go backend and SvelteKit frontend, leading to deployment complexities, duplicated concerns (e.g., API calls, routing setup), and context switching between languages. Consolidating into a SvelteKit monorepo will streamline development, unify the tech stack, simplify deployment, and improve overall developer experience. The recent issues with Go router configuration highlight the benefits of a single, integrated framework.

## What Changes

- **Remove Go Backend**: The entire `internal/` Go directory and `main.go` will be removed.
- **Migrate Backend Logic**: All existing Go API controllers (Faculties, Subjects, Periods, Commissions, Students, Assignments, Overview, Correction) will be re-implemented as SvelteKit Route Handlers (`+server.ts` files).
- **Database Access**: Migrate Go's SQLite interactions to Node.js/TypeScript using a suitable library (e.g., `better-sqlite3`).
- **Shared Schemas/Types**: Consolidate API request/response schemas and TypeScript types in a shared `src/lib/` or `src/types/` directory within the SvelteKit project.
- **Unified Deployment**: A single Docker image will be created for the SvelteKit application, containing both frontend and backend logic.
- **Deployment Orchestration**: A `docker-compose.yaml` file will be provided for easy local development and deployment setup.

## Capabilities

### New Capabilities

- `sveltekit-unified-api`: All API endpoints provided by SvelteKit Route Handlers.
- `typescript-sqlite-orm`: SQLite database interaction handled in TypeScript.
- `monorepo-deployment`: Single Docker image deployment with `docker-compose` support.
- `shared-types-and-schemas`: Consolidated TypeScript types and validation schemas.

### Modified Capabilities

- (None at this time, existing functionalities are being reimplemented).

## Impact

- **Project Structure**: Significant change, `internal/` will be removed.
- **Development Workflow**: Simplified dev server, unified debugging.
- **Deployment**: Single container, easier orchestration with Docker Compose.
- **Maintenance**: Reduced cognitive load, single language context.
- **Performance**: Improved SSR/SSG potential with SvelteKit.
