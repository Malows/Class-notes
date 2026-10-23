# Tasks

## 1. Esquema, migración y seed

- [x] 1.1 Add `persons` (name, legajo, soft delete) and `enrollments` (person_id, subject_period_id, nullable commission_id, soft delete) to `schema.ts` with the partial unique indexes from design D8; verify `pnpm check` passes and `drizzle.config.ts` still resolves the schema.
- [x] 1.2 Switch `assignments` to `subject_period_id`, recreate `deliveries` with `enrollment_id`, and add `WHERE deletedAt IS NULL` to the `subject_periods` unique index; verify `pnpm db:generate` creates one migration folder whose SQL contains all three changes.
- [x] 1.3 Write the backfill in dependency order — missing `subject_periods` rows, `persons` and `enrollments` with id-preserving `SELECT ... FROM students`, then `deliveries.enrollment_id = student_id` — and verify on a copy of an existing dev DB that roster counts and delivery counts match before and after.
- [x] 1.4 Rewrite `seed.ts` for persons + enrollments (legajos preserved) plus cursada-scoped assignments and deliveries; verify a fresh `rm class-notes.db* && pnpm dev` shows the same four commission rosters, and add a seed test asserting person count, enrollment count, and that every legajo survived.

## 2. Repositorios y servicios: personas e inscripciones

- [x] 2.1 Implement `person.repository.ts` (create, findById, search by query, legajo lookup) with an integration test covering duplicate-legajo rejection and legajo reuse after soft delete.
- [x] 2.2 Implement `enrollment.repository.ts` (roster by commission, pending by cursada, enroll, assign, unassign, remove) with tests covering duplicate enrollment rejection, re-enroll after removal, cross-cursada assignment rejection, and deleted person/enrollment disappearing from the roster.
- [x] 2.3 Implement the matching helper for search-then-create (trim, collapse whitespace, `COLLATE NOCASE`, legajo precedence) with unit tests for the accented-name miss and for legajo winning over a differing name.
- [x] 2.4 Implement `person.service.ts` and `enrollment.service.ts` on top of those repositories, with service tests asserting the created-vs-reused report counts returned by bulk registration.

## 3. Asignaciones y entregas sobre la cursada

- [x] 3.1 Point `assignment.repository.ts` at `subject_period_id` and scope the `create()` fan-out to the cursada; verify with a test where Matemática and Física share a period and creating a Matemática TP produces no deliveries for Física students.
- [x] 3.2 Convert `copy()` to cursada-to-cursada and verify with a test that copying from a previous cursada of the same subject duplicates only the definitions.
- [x] 3.3 Rewrite `delivery.repository.ts` joins to go through enrollments; verify `getOne`, `getAllByCommission`, `getCommissionOverviewData`, `getPendingSummary` and `getGlobalStats` tests still pass and that a deleted enrollment is excluded from the overview grid.

## 4. API

- [x] 4.1 Add `GET /api/v1/persons?q=`, `GET|POST /api/v1/enrollments`, and `PATCH|DELETE /api/v1/enrollments/[id]` as thin routes over the new services, with route tests covering the 400/409 paths (missing params, duplicate legajo, cross-cursada assignment).
- [x] 4.2 Switch `/api/v1/assignments*` to `subject_period_id`, delete `/api/v1/students/*`, update the affected route tests, and verify `pnpm test:server` passes.

## 5. Tipos compartidos, servicios de cliente y stores

- [x] 5.1 Replace the `Student` type with `Person` + `Enrollment` and key the grid row DTO by enrollment id; verify `pnpm check` lists every broken call site and that the list is empty once the rename pass is done.
- [x] 5.2 Add `person.service.ts` and `enrollment.service.ts` under `src/lib/client/services` with tests that mirror the existing `apiFetch` mocking pattern.
- [x] 5.3 Replace the students store with an enrollments store (runes class, new `StoreKey`), make the assignments store cursada-scoped, and update `context-initializer.ts`; verify the store tests pass with the new context key.

## 6. UI de la nómina

- [x] 6.1 Rebuild the commission students page as an enrollment roster, with an alta modal that searches existing persons (single add shows the match before confirming) and a paste mode that reports created vs. reused; add `enrollments.json` in EN and ES and verify the page render test passes with mocked `apiFetch` and store context.
- [x] 6.2 Add the "inscriptos sin comisión" pending section to the cursada's commissions page with an assign action; verify with a render test that an enrollment without commission appears there and not in any roster.
- [x] 6.3 Update `StudentTable`/`StudentRow` to render persons from enrollments, settle the Alumno/Estudiante vocabulary in `students.json`, and verify `pnpm validate:i18n` passes.

## 7. TPs y corrección sobre la cursada

- [x] 7.1 Point the assignments page, modal and store at `subject_period_id`; verify the assignments page test passes and that the page still loads from the existing subject/period URL params.
- [x] 7.2 Rewire `DeliveryForm`, the correct page and the overview grid to enrollment-keyed rows; verify the overview and correction tests pass and that clicking a cell still opens the correct TP/student pair.

## 8. Integración

- [x] 8.1 Run `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`, and fix every failure before moving on.
- [x] 8.2 Smoke test on a fresh database: create a TP for one subject, confirm no deliveries appear for another subject sharing the period, then enroll a new person, paste a list with an existing name, assign an enrollment to a commission, unassign it, delete one student, and confirm the overview still renders.
