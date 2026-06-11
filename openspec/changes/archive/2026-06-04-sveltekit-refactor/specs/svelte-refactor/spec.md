## ADDED Requirements

### Requirement: JSON API Endpoints

The backend SHALL provide JSON endpoints for all data operations, replacing the existing template rendering.

#### Scenario: Fetching Faculties via API

- **WHEN** the frontend sends a GET request to `/api/v1/faculties`
- **THEN** the backend returns a JSON array of all faculties

### Requirement: Static Asset Embedding

The Go binary SHALL embed the compiled SvelteKit frontend assets and serve them.

#### Scenario: Serving the Frontend

- **WHEN** the user accesses the root URL `/`
- **THEN** the backend serves the embedded `index.html` from the SvelteKit build

### Requirement: SPA Routing Support

The backend SHALL serve the main `index.html` for any request that does not match an API route or a static file.

#### Scenario: Deep linking to a commission

- **WHEN** the user navigates directly to `/commissions/1` in the browser
- **THEN** the backend serves `index.html`, allowing SvelteKit to handle the route client-side

### Requirement: Unified Build Process

The project SHALL include a Makefile that automates both the frontend compilation (pnpm) and the Go binary build.

#### Scenario: Full project build

- **WHEN** the user runs `make build`
- **THEN** the system installs frontend dependencies, builds the static site, and compiles the Go binary with the embedded assets
