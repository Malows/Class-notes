## 1. Setup & DTOs

- [x] 1.1 Create `internal/repository`, `internal/controllers`, `internal/dto`, and `internal/router` directories
- [x] 1.2 Define DTOs in `internal/dto` for all entities and responses

## 2. Repository Layer

- [x] 2.1 Implement repositories in `internal/repository` (Faculty, Subject, Period, Commission, Student, Assignment, Delivery)
- [x] 2.2 Use interfaces for each repository

## 3. Controller Layer

- [x] 3.1 Refactor existing handlers into `internal/controllers` using the new repositories and DTOs

## 4. Router & Integration

- [x] 4.2 Implement router setup in `internal/router`
- [x] 4.3 Update `main.go` to use the new architecture
- [x] 4.4 Verify API and build
