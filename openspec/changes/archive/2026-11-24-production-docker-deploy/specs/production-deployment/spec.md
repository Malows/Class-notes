# Spec Delta

## Purpose

Defines how the application is packaged, configured and booted as a production container: a reproducible multi-stage image on a supported Node LTS, a runtime-configurable SQLite file on a persistent volume, schema migrations applied at deploy time, and demo data kept out of production.

## ADDED Requirements

### Requirement: Runtime-configured database location

The deployed application SHALL resolve its SQLite file path from the environment at process start, so the same image can run against any mounted volume without rebuilding.

#### Scenario: Operator points the app at a mounted volume

- **WHEN** the container starts with `DATABASE_PATH=/app/data/class-notes.db`
- **THEN** the server opens (creating it if needed) exactly that file and writes no database file elsewhere

#### Scenario: Missing configuration

- **WHEN** the container starts without `DATABASE_PATH`
- **THEN** startup fails with a message naming the missing variable instead of silently creating a database in the working directory

### Requirement: Data survives container replacement

Database files SHALL live only under a directory intended for persistent storage, so recreating or upgrading the container does not destroy user data.

#### Scenario: Container recreated from a new image

- **WHEN** the container is destroyed and recreated with the same volume mounted
- **THEN** all previously stored data is still present and no migration re-runs destructively

#### Scenario: Volume not mounted

- **WHEN** the deployment starts without the data volume
- **THEN** the operator can detect the misconfiguration before data is written (missing directory or explicit startup check)

### Requirement: Migrations applied independently of demo data

Deployment SHALL apply pending schema migrations as its own step, separate from any demo-data seeding, and the server SHALL start only after migrations succeed.

#### Scenario: Fresh database on first deploy

- **WHEN** a container starts against an empty data directory
- **THEN** all migrations run, the schema exists, and the application serves requests with no demo records

#### Scenario: Migration failure

- **WHEN** a migration fails
- **THEN** the server does not start, the failure is logged with the offending migration, and the process exits non-zero

### Requirement: Migrations are tracked

The system SHALL record which migrations have been applied, so deploys against an existing database apply only what is pending instead of relying on the presence of a single table.

#### Scenario: New migration shipped over existing data

- **WHEN** a release adds a migration and the database already has user data
- **THEN** only the new migration is applied, existing rows are preserved, and re-running the deploy applies nothing

#### Scenario: Repeated startup

- **WHEN** the same image restarts several times
- **THEN** migrations are no-ops after the first successful run

### Requirement: Migrations ship in the runtime artifact

The production runtime SHALL contain the migration files or their content; a deployed server MUST NOT depend on the source tree being present.

#### Scenario: Image built without the repository

- **WHEN** the runtime image is started with only its built files, outside a git checkout
- **THEN** migrations are found and applied successfully

### Requirement: No demo seeding in production

The production runtime MUST NOT insert demo faculties, subjects, periods, enrollments, assignments or deliveries, under any `NODE_ENV` value.

#### Scenario: Production boot on a fresh volume

- **WHEN** the container starts with production settings against an empty database
- **THEN** the schema is created and the entity lists are empty

#### Scenario: Development-style flag in a production image

- **WHEN** a production container is started with `NODE_ENV=development`
- **THEN** demo data is still not inserted

### Requirement: Demo data is opt-in outside production

The development and test workflows SHALL keep their seeded fixtures, activated only by an explicit signal rather than by the absence of configuration.

#### Scenario: Local development first run

- **WHEN** a developer starts the dev server with no database file
- **THEN** the schema is created and the demo fixtures are inserted

#### Scenario: Seeding an intentionally populated demo server

- **WHEN** an operator explicitly requests demo data for a non-production environment
- **THEN** the fixtures are inserted idempotently and the command reports what it wrote

### Requirement: Reproducible image build

The image SHALL be built in explicit stages with a pinned package manager and a supported Node LTS runtime, and SHALL install only what the runtime needs.

#### Scenario: Rebuilding the same commit

- **WHEN** the image is rebuilt from the same commit and lockfile
- **THEN** the Node and pnpm versions are identical to the previous build and the lockfile is not rewritten

#### Scenario: Building from a clean clone

- **WHEN** the image is built from a checkout without local environment files
- **THEN** the build succeeds without requiring secrets or a committed `.env`

### Requirement: Build context excludes local artifacts

The image build SHALL ignore local development artifacts so they never reach the image.

#### Scenario: Local database and env files present

- **WHEN** the developer builds the image while `class-notes.db*`, `.env`, `node_modules`, `build`, `.svelte-kit` and coverage output exist locally
- **THEN** none of them are sent to or present in the image

### Requirement: Non-root runtime with health signal

The production container SHALL run as a non-root user and expose a health signal the orchestrator can poll.

#### Scenario: Container health

- **WHEN** the service is running and serving requests
- **THEN** the image health check succeeds, and it fails once the process stops responding
