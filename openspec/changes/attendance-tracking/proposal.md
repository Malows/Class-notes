# Proposal

## Why

The person/enrollment split was built so attendance could exist: today the app tracks what a student delivers, but not whether they showed up. There is no way to record attendance at a TP, no way to see a student's attendance across a cursada, and nothing that lets a teacher take attendance from a phone while standing in front of the class.

## What Changes

- Add an `attendances` record per (TP, enrollment) with a `status` of `PRESENT` or `ABSENT`, the date it was recorded, and the commission where it was taken. **No record means "not taken yet"**, which is what makes the tri-state honest: an unmarked cell is never confused with an absence.
- Taking attendance for the same TP twice overwrites the previous value and updates `recorded_on` (one state per TP — see design D1 for the accepted trade-off).
- Add a **commission attendance grid** (rows: the commission's roster; columns: the cursada's TPs) and a **cursada attendance grid** (rows: every enrollment of the subject in that period, with its commission as a label).
- Add a **sequential take mode** for a chosen TP and commission: one student at a time, swipe right = present, left = absent, up = skip (leaves it unmarked), with keyboard equivalents, an undo for the last decision, and a "mark every student present" shortcut.
- Show a per-student **attendance summary** across the cursada's TPs, and a per-TP count of present students. Unmarked TPs are never counted as absences.
- Add `GET /api/v1/periods/:id/subjects/:subjectId/students` to the academic hierarchy: the students enrolled in a cursada, each with the commission it belongs to, so the attendance pages do not have to resolve commission labels from a second source.
- No **BREAKING** change for existing data: the new table is additive and needs no backfill.

## Capabilities

### New Capabilities

- `attendance`: recording presence at a TP, the tri-state (present / absent / not taken), the two grid scopes, sequential take mode, and the attendance summary.

### Modified Capabilities

- `academic-hierarchy`: adds a cursada roster read — the students enrolled in a subject for a period, with the commission each one belongs to.

## Impact

- **Schema**: new `attendances` table (PK `assignment_id` + `enrollment_id`, `status`, `recorded_on`, `commission_id`, `subject_period_id`, soft delete) plus unique indexes on `assignments (id, subject_period_id)` and `enrollments (id, subject_period_id)` so the composite foreign keys can enforce the same-cursada rule in SQLite; a new migration.
- **Server**: `attendance.repository.ts` and `attendance.service.ts` (grid by commission, grid by cursada, upsert, unmark, bulk apply, summary), reusing `assignmentRepository.getAll`; `enrollmentRepository` gains a cursada roster projection with commission labels.
- **API**: `GET /api/v1/attendance?commission_id=` / `?subject_period_id=` (grid), `GET|PUT|DELETE /api/v1/attendance/:assignmentId/:enrollmentId`, `POST /api/v1/attendance/bulk`, and `GET /api/v1/periods/:id/subjects/:subjectId/students` in the academic hierarchy.
- **Client**: `attendance.service.ts`, an attendance store, an `AttendanceGrid` modelled on the existing overview grid, three pages (commission grid, cursada grid, take mode) and a `TakeAttendanceCard` with pointer gestures.
- **i18n**: new `attendance.json` namespace in EN and ES.
- **Tests**: repository integration tests for the tri-state, overwrite and cross-cursada rejection; service tests for the summary; route tests; page render tests; a unit test for the gesture threshold; a smoke run on a fresh database.
- **Operational risk to flag**: migrations only run when the database is created from scratch, so the new table requires deleting `class-notes.db*`. That is tolerable today, but once real attendance is recorded, the supported reseed path would destroy it — see design `Risks` for the recommended follow-up.
- **Out of scope**: attendance thresholds and "regularidad" rules, session-per-class (multiple dates for the same TP), offline queueing, automatic absence marking, and **guest attendance** — marking a student of another commission of the same cursada. The record already stores the commission it was taken in, so guest support would be a UI addition later, not a migration.
