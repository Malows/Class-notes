# Tasks

## 1. Roster de cursada (jerarquía académica)

- [x] 1.1 Add `getCursadaRoster(subjectPeriodId)` to `enrollment.repository.ts` joining `commissions`, so each row carries the commission id, name and slug, and including the subject, the period and the cursada's commissions in the result; verify with a test that an enrollment without commission is returned with null commission fields, that rows are ordered by person name, and that deleted enrollments, persons and commissions are excluded.
- [x] 1.2 Add `GET /api/v1/periods/:id/subjects/:subjectId/students` delegating to that read; verify with route tests that a valid pair returns the roster with its subject and period, that a subject not linked to the period returns 404, and that a non-numeric id returns 400.

## 2. Esquema y migración

- [x] 2.1 Add the `attendances` table to `schema.ts` — PK `(assignment_id, enrollment_id)`, `status`, `recorded_on`, `commission_id`, `subject_period_id` and soft delete — plus `UNIQUE (id, subject_period_id)` on `assignments` and `enrollments`; verify `pnpm check` passes.
- [x] 2.2 Generate the migration with the two composite foreign keys and verify on a fresh database that `PRAGMA foreign_key_list(attendances)` lists both, and that inserting a record whose enrollment belongs to another cursada is refused by the database.
- [x] 2.3 Extend `db.test.ts` to assert the new table and both composite FKs survive `initializeDatabase`; verify the test fails if the table is missing.

## 3. Repositorio

- [x] 3.1 Implement `attendance.repository.ts` with `getOne`, `upsert`, `unmark`, `bulkUpsert`, `getByCommission` and `getByCursada`; verify with tests that unmark leaves no row, that re-recording updates the existing row instead of duplicating it, and that `recorded_on` moves to the new date.
- [x] 3.2 Verify the row set of a commission grid in those tests: the roster plus enrollments with a record taken in that commission, and that a deleted enrollment or deleted person disappears from both grids.
- [x] 3.3 Compute the summary in the repository and verify with tests that an assignment with no record is not counted as an absence, that a column with no records reports empty rather than zero, and that a guest's record appears both in the commission where it was taken and in the guest's own commission grid.

## 4. Servicio

- [x] 4.1 Implement `attendance.service.ts` returning the grid DTO (rows with person, commission and cells, plus per-row and per-column summaries) and a `bulk` entry point that derives `subject_period_id` from the assignment; verify with service tests that the derived cursada is written and that a cross-cursada enrollment is rejected before touching the table.

## 5. API

- [x] 5.1 Add `GET /api/v1/attendance?commission_id=` and `?subject_period_id=` (400 when neither is given); verify with route tests for both scopes and the 400.
- [x] 5.2 Add `GET|PUT|DELETE /api/v1/attendance/:assignmentId/:enrollmentId` and `POST /api/v1/attendance/bulk`; verify with route tests that PUT returns the stored record, DELETE returns 204, a cross-cursada enrollment maps to 409, and an unknown assignment maps to 404.

## 6. Cliente

- [x] 6.1 Add `attendance` types to the shared types, an `attendance.service.ts` and an attendance store; verify with service and store tests that the grid URL is built per scope and that a decision updates the cell without a full reload.

## 7. Vistas

- [x] 7.1 Build `AttendanceGrid.svelte` (rows = enrollments, columns = assignments, cells showing present/absent/not-taken, row and column summaries) and mount it on `.../commissions/{slug}/attendance` and `.../periods/{year}/{semester}/attendance`, adding the navigation entry points on the commission row and the commissions page; verify with render tests for both scopes, including the empty-column state and the guest label.
- [x] 7.2 Build the take mode at `.../commissions/{slug}/attendance/take?assignment_id=` with one card per student, a progress counter, a "mark all present" action and an end-of-run report; verify with a render test that the run reports present/absent/skipped and that skipped students stay unmarked.
- [x] 7.3 Implement the gesture layer with pointer events and a threshold of `max(80px, 20%)` plus axis dominance, and wire the arrow keys and the three visible buttons; verify with a unit test for the gesture decision and a render test that keyboard and buttons produce the same records and that undo restores the previous value.
- [x] 7.4 Add the guest picker inside take mode, searching persons of the same cursada who are not in the roster; verify with a render test that the picked person is appended as a guest and stored with this commission's id.

## 8. i18n e integración

- [x] 8.1 Add the `attendance.json` namespace in EN and ES covering the grids, the take mode, the guest picker and the summary — and the labels the cursada roster needs on the academic side; verify `pnpm validate:i18n` passes.
- [x] 8.2 Run `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`, fixing every failure.
- [x] 8.3 Smoke test on a fresh database: read the cursada roster and confirm it lists every enrolled student with its commission, mark a student present and another absent for a TP, unmark one and confirm it returns to not-taken, re-record the same TP and confirm it overwrites with a new date, mark a guest from another commission and confirm the value shows in both grids and in the cursada roster totals.
