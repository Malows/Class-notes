# Tasks

## 1. API: period retrieval by id

- [x] 1.1 Add `getById(id)` to `periodRepository` (select id/year/semester where `deletedAt IS NULL`) and verify a repository test covers lookup by id and 404-equivalent (undefined) for missing/deleted periods
- [x] 1.2 Add `getById` to `periodService` and a `GET` handler in `src/routes/api/v1/periods/[id]/+server.ts` returning `{ data: period }` / 404, and verify the API test asserts `GET /api/v1/periods/{id}` returns the period and a 404 for unknown ids

## 2. Semantic period URLs `/periods/{year}/{semester}`

- [x] 2.1 Add `getByYearSemester(year, semester)` to repository/service and expose it via `GET /api/v1/periods?year=&semester=` (returns the matching period or 404), verifying the API test covers hit and miss cases
- [x] 2.2 Reparent the route: move the period-subjects page to `src/routes/periods/[year]/[semester]/subjects`, resolving `(year, semester)` to the period id for the subjects calls and the page title, and verify the page loads for `/periods/2026/2/subjects` against seeded data
- [x] 2.3 Update global `PeriodRow` links from `/periods/{id}/subjects` to `/periods/{year}/{semester}/subjects` and verify navigation from `/periods` reaches the page (component/UI test)
- [x] 2.4 Show an empty/not-found state (no server error) for a nonexistent `(year, semester)` combination and verify it with a render test

## 3. "Materias" action in subject-scoped periods table

- [x] 3.1 Change `SubjectPeriodRow`'s "Materias" button from `onEdit(period)` to an `href` link to `/periods/{year}/{semester}/subjects` and verify a component test asserts the row renders the link and does not call onEdit

## 4. Sidebar quick access with real data

- [x] 4.1 Fix `getActiveMetadata`: active quarter = sem 1 for months 3–7, sem 2 for months 8–12, months 1–2 → previous year sem 2; return subjects of that quarter with direct hrefs and verify repository/service tests with fixed dates (e.g. August → 2026-2) produce non-empty subjects
- [x] 4.2 Switch `Sidebar.svelte` to the context store instances (`getContext`) and trigger guarded loads (respecting `loaded`) for the current faculty/subject/period context, and verify with a component test that context sections render the real sibling items (subjects/periods/commissions) as working links
- [x] 4.3 Verify the active-quarter section renders "Cuatrimestre Activo (year - term)" with the seeded subjects on the dashboard, via a UI walkthrough or component test

## 5. Database reconciliation (migrations + seed)

- [x] 5.1 Fix `drizzle.config.ts` to point at `./src/lib/server/database/schema.ts` and verify `pnpm exec drizzle-kit generate --explain` resolves the schema without the "No schema files found" error
- [x] 5.2 Add a unique index on `periods (year, semester)` and verify it appears in `generate --explain` output and is applied on a fresh database
- [x] 5.3 Regenerate + commit migrations adding `commissions.subject_id` (FK subjects) and widening `assignments.workflow_status` CHECK to the 5 app statuses (`NOT_DICTATED`, `WAITING_FOR_STUDENTS`, `WAITING_FOR_CORRECTION`, `APPROVED`, `REJECTED`), preserving FKs on recreation, and verify the migrations apply cleanly to a fresh SQLite database
- [x] 5.4 Reset the local dev DB (delete `class-notes.db*`) and verify a fresh start seeds commissions, students, assignments, and deliveries (assert non-zero row counts via a smoke test or API calls)

## 6. Integration verification

- [x] 6.1 Walk through the app: `/periods/2026/1/subjects` shows the period's subjects, the sidebar quick access shows active-quarter subjects + sibling lists, the commissions page shows the seeded commission, and the dashboard shows non-zero counts
- [x] 6.2 Run `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm validate:i18n` and verify all pass with the new tests included