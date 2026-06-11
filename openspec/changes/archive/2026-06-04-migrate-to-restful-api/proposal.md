## Why

The current API uses non-standard route names and patterns (e.g., `/api/v1/faculties/create`, `/api/v1/students/delete`). Migrating to a RESTful API will improve maintainability, developer experience, and follow standard web conventions.

## What Changes

- Redesign existing routes to follow RESTful principles (e.g., `GET /api/v1/faculties`, `POST /api/v1/faculties`).
- Update controller methods to map correctly to REST verbs.
- Ensure consistent response structures.

## Capabilities

### New Capabilities

- `restful-api-structure`: Migration of all existing API endpoints to RESTful conventions.

### Modified Capabilities

-

## Impact

- All frontend service layer endpoints will need updates to match new route structures.
- Backend routing in `internal/router/router.go` and controller methods.
