## Context

Refactoring the Go backend from a monolithic handler structure to a layered architecture.

## Goals / Non-Goals

**Goals:**

- Separate DB logic from HTTP logic.
- Use DTOs for data validation and API consistency.
- Centralize routing.
- Enable dependency injection.

**Non-Goals:**

- Changing existing database schema.
- Changing frontend functionality.

## Decisions

### 1. Repository Pattern

- Package: `internal/repository`
- Responsibilities: Executing SQL, mapping rows to models.
- Pattern: Interfaces for easier mocking in tests.

### 2. Controller Pattern

- Package: `internal/controllers`
- Responsibilities: Parsing requests, calling repos, returning JSON/errors via DTOs.

### 3. DTO (Data Transfer Object)

- Package: `internal/dto`
- Responsibilities: Structs for input (requests) and output (responses).

### 4. Router

- Package: `internal/router`
- Responsibilities: Setting up `http.ServeMux` and registering routes.

### 5. Dependency Injection

- `main.go` will initialize DB → Repos → Controllers → Router.

## Risks / Trade-offs

- **Boilerplate** → More files and lines of code. _Mitigation_: Cleaner long-term maintenance.
