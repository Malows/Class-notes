## Why

Current backend implementation mixes database queries and API logic within the same handlers. This makes testing difficult and leads to code duplication. Introducing a layered architecture (Repository, Controller, DTO, Router) will improve maintainability, testability, and separation of concerns.

## What Changes

- **Repository Layer**: New `internal/repository` package for all DB operations.
- **DTO Layer**: New `internal/dto` package for API request/response structures.
- **Controller Layer**: Refactor `internal/handlers` into `internal/controllers`, using repositories instead of raw DB calls.
- **Router Layer**: New `internal/router` package to encapsulate routing logic.
- **Project Structure**: Standardize `internal/` layout.

## Capabilities

### New Capabilities

- `layered-architecture`: Structured backend with distinct responsibilities.
- `api-dtos`: Decoupled internal models from external API representation.

### Modified Capabilities

- `json-api`: Refactored to use the new controller/dto flow.

## Impact

- **Code Quality**: Better isolation.
- **Refactoring**: Heavy changes to `main.go` and all handler files.
