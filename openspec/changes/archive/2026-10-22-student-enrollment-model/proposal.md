# Proposal

## Why

`students` conflates three different things in a single row: the person, the fact that this person is taking a subject in a period (the *cursada*), and the commission they were assigned to. Because the row can only point at one commission, a person cannot exist twice in the system, so the `external_id` (legajo) column is written by the seed but silently dropped by every repository — there is nowhere for a stable person identity to live.

This blocks the attendance feature (a student who attends another commission of the same subject must be recognizable as the *same* person, and attendance must be scoped to a cursada so guests can only come from the same subject and period), and it already leaks data: `assignments.period_id` has no subject, so creating a TP of one subject fans out `deliveries` rows to students of every other subject sharing that period.

## What Changes

- **BREAKING** — Split `students` into `persons` (name, legajo) and `enrollments` (`person_id`, `subject_period_id`, nullable `commission_id`). A person exists once; an enrollment is "this person takes this subject in this period", optionally assigned to one commission.
- **BREAKING** — `deliveries` and future `attendances` reference an enrollment instead of a student row. The eligibility rule becomes structural: a delivery or attendance can only involve an enrollment of the same cursada as the assignment.
- **BREAKING** — `assignments` belongs to a cursada (`subject_period_id`) instead of a period. Creating a TP no longer creates rows for students of other subjects; copying TPs works between cursadas.
- Student registration becomes search-then-create: adding a student matches existing persons by legajo (or exact name within the cursada) and only creates a new person when there is no match, reporting how many were enrolled vs. reused.
- Legajo is optional but unique among active persons; a unique index guarantees one active enrollment per person per cursada.
- Deleting a student deletes the enrollment, never the person.
- Fix the `subject_periods` unique index so it ignores soft-deleted links, allowing a subject to be unlinked and re-linked to a period.
- UI vocabulary settles on **Alumno** for the person and **Inscripción** / **cursada** for the enrollment.

## Capabilities

### New Capabilities

- `student-enrollment`: person registry, enrollment (cursada) lifecycle, legajo uniqueness, search-then-create registration, commission assignment, and the commission roster derived from enrollments.

### Modified Capabilities

- `academic-hierarchy`: the "Student Management" requirement changes from managing students of a Commission to managing enrollments of a cursada with an optional commission assignment; seeded data must persist through the new tables.
- `assignment-management`: TPs attach to a cursada instead of a period, which fixes the availability rule to all Commissions of that Subject in that Period and makes copying TPs a cursada-to-cursada operation.

## Impact

- **Schema and data**: `src/lib/server/database/schema.ts` and `relations.ts` (`persons`, `enrollments`, `deliveries.enrollment_id`, `assignments.subject_period_id`, `subject_periods` index fix); a new migration under `database/migrations/`; `seed.ts` rewritten (19 seeded students become 19 persons + 19 enrollments, legajos already unique).
- **Server**: `student.repository.ts`/`student.service.ts` (rewritten), `assignment.repository.ts` (period → cursada, fan-out scope), `delivery.repository.ts` (joins through enrollments), `period-subject.repository.ts` (re-link fix), plus a new `person` and `enrollment` repository/service pair.
- **API**: `/api/v1/students` and `/api/v1/assignments` change their identifier from `commission_id` / `period_id` to `enrollment_id` / `subject_period_id`; new endpoints for person lookup and enrollment creation.
- **Client**: `students` and `assignments` stores, `student.service.ts`, `assignment.service.ts`, `StudentModal` (adds person search), `StudentTable`/`StudentRow`, assignment pages and `DeliveryForm` wiring; new i18n namespace `enrollments.json` (EN + ES) and vocabulary cleanup in `students.json` (Alumno vs. Estudiante).
- **Tests**: repository integration tests for persons/enrollments and the re-link case, page render tests for the student screens, and updated assignment/delivery repository tests.
- **Blast radius**: ~86 references to `students.commission_id` across 8 files and ~19 references to `assignments.period_id`; no CI, so `pnpm check`, `pnpm lint`, `pnpm validate:i18n` and the relevant suites are the gate.
- **Not in scope**: attendance itself (separate change `attendance-tracking`), and any many-to-many enrollment-to-commission relation — the recorded-in commission on attendance covers guest cases.
