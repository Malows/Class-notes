## 1. Project Setup & Cleanup

- [x] 1.0 Move `frontend/` contents to project root (`./`).
- [x] 1.1 Remove `internal/` directory and `main.go`.
- [x] 1.2 Update `go.mod`, `go.sum`, `Makefile` to remove Go-related entries.
- [x] 1.3 Install `better-sqlite3` and `@types/better-sqlite3` in root.

## 2. Database & Repository Layer Migration

- [x] 2.1 Create `src/lib/server/db.ts` for database connection/utilities.
- [x] 2.2 Create `src/lib/server/repositories/` directory.
- [x] 2.3 Migrate `facultyRepository` logic to `src/lib/server/repositories/faculty.repository.ts`.
- [x] 2.4 Migrate `subjectRepository` logic to `src/lib/server/repositories/subject.repository.ts`.
- [x] 2.5 Migrate `periodRepository` logic to `src/lib/server/repositories/period.repository.ts`.
- [x] 2.6 Migrate `commissionRepository` logic to `src/lib/server/repositories/commission.repository.ts`.
- [x] 2.7 Migrate `studentRepository` logic to `src/lib/server/repositories/student.repository.ts`.
- [x] 2.8 Migrate `assignmentRepository` logic to `src/lib/server/repositories/assignment.repository.ts`.
- [x] 2.9 Migrate `deliveryRepository` logic to `src/lib/server/repositories/delivery.repository.ts`.

## 3. API Route Handlers Migration

- [x] 3.1 Create `src/routes/api/v1/faculties/+server.ts` for `GET` and `POST`.
- [x] 3.2 Create `src/routes/api/v1/subjects/+server.ts` for `GET` and `POST`.
- [x] 3.3 Create `src/routes/api/v1/periods/+server.ts` for `GET` and `POST`.
- [x] 3.4 Create `src/routes/api/v1/commissions/+server.ts` for `GET` and `POST`.
- [x] 3.5 Create `src/routes/api/v1/students/+server.ts` for `GET` and `POST/DELETE`.
- [x] 3.6 Create `src/routes/api/v1/assignments/+server.ts` for `GET`, `POST`, `DELETE`, and `/copy`.
- [x] 3.7 Create `src/routes/api/v1/overview/+server.ts` for `GET`.
- [x] 3.8 Create `src/routes/api/v1/correct/+server.ts` for `GET` and `POST`.
- [x] 3.9 Create `src/routes/api/v1/health/+server.ts` for `GET`.

## 4. Shared Schemas & Types

- [ ] 4.1 Review and ensure all types in `src/lib/types.ts` are comprehensive.
- [ ] 4.2 Review and update Zod schemas in `src/lib/schemas/` to reflect all API request/response bodies.

## 5. Deployment

- [ ] 5.1 Create `Dockerfile` for the SvelteKit application.
- [ ] 5.2 Create `docker-compose.yaml` for local orchestration, including SQLite volume.
- [ ] 5.3 Update `vite.config.ts` to remove `server.proxy` configuration.
- [ ] 5.4 Update `package.json` to remove old scripts like `check`.
