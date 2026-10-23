# Design

## Context

See `proposal.md` — Why. Constraints that shape the approach:

- SQLite + Drizzle; schema in `src/lib/server/database/schema.ts`, relations in `relations.ts`, one folder per migration under `database/migrations/`, applied automatically on fresh DB init and followed by `seed.ts`.
- Every entity is soft-deleted (`deletedAt`), and uniqueness is enforced with **partial** unique indexes `WHERE deletedAt IS NULL`. `subject_periods` is the exception: its index lacks that filter, which is a live bug once soft-deleted links must be revivable.
- Repositories own all SQL; services hold business rules; routes are thin. Tests run against real in-memory SQLite, so repository tests are integration tests.
- The app is not in production: no production data to preserve, and the documented dev workflow is "delete `class-notes.db*` and restart" to reseed. That removes the need for a rollback path built on data fidelity.
- `assignments` currently hangs off `period_id` only, and `assignment.create()` fans out `deliveries` to **every** student of every commission in the period — including other subjects. This is the leak the split has to close.

## Goals / Non-Goals

**Goals:**

- One person record per human, with legajo living where it can survive across cursadas.
- Attendance-ready shape: anything a student produces (delivery, later attendance) points at an enrollment, so "same subject and period" is checkable from the row itself.
- Keep the existing navigation, slugs, and page URLs untouched.
- Keep the roster query cheap and explicit: one repository method per view.

**Non-Goals:**

- No `enrollments_commissions` join table (see Decisions).
- No person-merge UI, no CSV import format, no person editing beyond name/legajo.
- No attendance tables in this change.
- No change to `commissions` columns (`subject_id` + `period_id` stay denormalized).

## Decisions

### D1. Two tables (`persons` + `enrollments`) instead of relaxing `students.commission_id`

`students` is already an enrollment wearing a person's clothes: `external_id` is written by the seed and then dropped by every select, because the row has nowhere to represent "the same human in two places". Making `commission_id` nullable would unblock the roster but leave person identity unsolved, so attendance guests would still be unrecognizable as the same person.

```
persons                              enrollments
+----+--------+---------+            +----+-----------+------------------+---------------+
| id | name   | legajo  |            | id | person_id | subject_period_id| commission_id |
+----+--------+---------+            +----+-----------+------------------+---------------+
|  1 | Beto   | ING-001 |            |  1 |     1     |        7         |   2 (or NULL) |
+----+--------+---------+            +----+-----------+------------------+---------------+
        ^                                  ^   ^              ^
        |                                  |   |              |
   identidad estable                  la cursada  comisión asignada (opcional)
```

Alternative rejected: keep one table with a nullable `commission_id` and a `person_key` column — it defers the join but keeps two responsibilities in one row, and the "one enrollment per cursada" invariant would have to be enforced by application code.

### D2. The enrollment anchors on `subject_periods`, not on `(subject_id, period_id)`

`subject_periods` already *is* the cursada. Reusing it avoids a second representation of the same pair and gives enrollment a single FK to the thing the UI already calls a cursada. The cost is one join in roster queries, which the repositories pay anyway.

### D3. Commission assignment is a nullable FK on the enrollment — no M2M

`commission_id` NULL means "enrolled in the subject, not yet assigned to a commission" — a real state today with no representation. It gives the pending list for free.

A many-to-many (`enrollments_commissions`) was considered and rejected: it would model "belongs to A and B", which is almost always false, and the genuine case (attending another commission once) is already covered by the recorded-in commission on attendance. Adding it now would make "which commission is this student's?" ambiguous for the roster, the overview, and the pending counters.

Consequence to accept: a guest is *not* in the other commission's roster. They appear there only through their attendance rows, in the attendance change.

### D4. `assignments.subject_period_id` replaces `period_id`

A TP belongs to a cursada, not to a cuatrimestre. `create()` then fans out `deliveries` to enrollments of that cursada only, which fixes the cross-subject leak at its source. `copy(source, target)` becomes cursada-to-cursada, which is what "copiar los TPs del cuatrimestre anterior" already means.

`assignments` is the only place the leak is materialized, so no composite-FK guard is added here. The composite-FK trick (`(assignment_id, subject_period_id)` + `(enrollment_id, subject_period_id)` on the same table) is deferred to `attendance-tracking`, where a cross-cursada guest is a real risk rather than a hypothetical one.

### D5. Identifier continuity in the migration

`enrollments.id` and `persons.id` are seeded from `students.id` during backfill, so any reference to a student keeps its numeric identity:

```
students(id=5, commission_id=2)
   -> persons(id=5, name, legajo)
   -> enrollments(id=5, person_id=5, subject_period_id=<cursada of commission 2>, commission_id=2)
```

Any commission whose `(subject_id, period_id)` has no `subject_periods` row gets one inserted first.

**Assignments and deliveries are not backfilled.** A TP's cursada cannot be derived: `assignments` only knew `period_id`, and every period is shared by 3–4 cursadas. Measured on the dev database, guessing the cursada (lowest `subject_period` of the period) would put **9 of 28 deliveries** in a different cursada than their assignment — silently breaking the same-cursada invariant this change exists to enforce. Both tables are therefore recreated empty by the migration.

This costs nothing in practice: migrations only run when the `faculties` table is missing, so an existing dev database never applies this migration at all and must be deleted and reseeded. The backfill exists for correctness on a fresh deployment, where the tables are empty anyway.

### D6. Search-then-create matching rules

Order of precedence per entry: legajo → normalized exact name within the same cursada → create.

Normalization is trim + collapse internal whitespace + ASCII case-insensitive compare (`COLLATE NOCASE`). SQLite's `NOCASE` does not fold accented characters, so `JOSÉ` and `José` do **not** match without a legajo — documented limitation, with the legajo as the escape hatch. Fuzzy matching is deliberately rejected: a wrong merge is silent data corruption, a missed merge is visible and fixable.

Single adds show the matched person before confirming; bulk paste does not ask per name, it reports counts and the list of created vs. reused.

### D7. Deletion semantics

| Action | Effect |
|---|---|
| Delete student from a commission roster | Soft-delete the **enrollment**; person untouched |
| Unassign | `commission_id = NULL`; enrollment survives in the pending list |
| Delete a person | Soft-delete the person **and** their active enrollments (a deleted person must not linger in rosters) |

Repositories must filter `deletedAt` on both `persons` and `enrollments` on every roster/overview path. This is the main new failure mode; see Risks.

### D8. Indexes

```
persons      UNIQUE (legajo) WHERE deletedAt IS NULL AND legajo IS NOT NULL
enrollments  UNIQUE (person_id, subject_period_id) WHERE deletedAt IS NULL
subject_periods  UNIQUE (subject_id, period_id) WHERE deletedAt IS NULL   <- fix
```

SQLite treats NULLs as distinct in unique indexes, so the `legajo IS NOT NULL` clause is documentation more than necessity — kept explicit so the intent survives a future database swap.

### D9. API surface

Page URLs are unchanged (`/commissions/{slug}/students` still means "la nómina"). The API moves to the new nouns:

- `GET /api/v1/persons?q=` — person lookup for the alta picker
- `GET /api/v1/enrollments?commission_id=` / `?subject_period_id=` — roster / pending list
- `POST /api/v1/enrollments` — enroll one person or a pasted batch, returns created vs. reused counts
- `PATCH /api/v1/enrollments/[id]` — assign/unassign commission
- `DELETE /api/v1/enrollments/[id]`
- `/api/v1/students/*` is removed; `/api/v1/assignments` takes `subject_period_id` instead of `period_id`

### D10. Naming

`persons` / `enrollments` in code (English, like every other table); **Alumno** for the person and **Inscripción** / *cursada* for the enrollment in i18n. This also settles the existing Alumno/Estudiante inconsistency in `students.json`. New namespace `enrollments.json` (EN + ES); `students.json` keys are reused where the meaning survives and renamed where it does not.

## Risks / Trade-offs

- **Missing a `deletedAt` filter at three levels** → roster shows deleted people. Mitigation: roster/pending/overview paths go through dedicated repository methods, never ad-hoc joins in services; repository tests assert a deleted enrollment and a deleted person both disappear from the roster.
- **Silent wrong merge by name** (two real people, same normalized name) → one person with two enrollments, indistinguishable later. Mitigation: legajo-first matching, exact-match-only fallback, and single adds show the matched person before writing.
- **Accented-name misses** in `NOCASE` → duplicate persons in the registry. Mitigation: accepted and documented; legajo is the deterministic path.
- **Type churn**: `Student` → `Person` + `Enrollment`, and `StudentGridRowDTO` rows become enrollment-keyed, rippling into the overview grid and its tests. Mitigation: do the rename as one mechanical pass, then `pnpm check` before wiring behavior.
- **Every roster query gains a join** (~86 references across 8 files) → slower than today on large rosters. Mitigation: irrelevant at the current scale (19 seeded students); indexes on `enrollments.commission_id` and `enrollments.subject_period_id` keep the joins cheap.
- **`subject_periods` re-link fix may surprise** existing data where a soft-deleted link blocked a re-link → it only unblocks; no data rewrite needed.
- **Build gate**: `pnpm build` runs `validate:i18n`, so a missing ES/EN key fails the build, not just the page. Mitigation: add both languages in the same commit as the component.

## Migration Plan

1. New migration folder: create `persons`, `enrollments`; add `subject_period_id` to `assignments` (table recreate, `period_id` dropped); recreate `deliveries` with `enrollment_id`; fix the `subject_periods` unique index.
2. Backfill: missing `subject_periods` rows → `persons` from `students` (id-preserving) → `enrollments` from `students` (id-preserving). `assignments` and `deliveries` are recreated empty (see D5).
3. Drop `students`.
4. Rewrite `seed.ts`: 19 persons (legajos `ING-001`… already unique in the seed), 19 enrollments pointing at the cursada derived from each student's commission, then assignments and deliveries for the cursada.
5. Land schema + repositories + services + API + client in the same change; the intermediate state does not compile, so it ships as one commit series, gated by `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server`, `pnpm test:client`.
6. **Rollback**: no production data, so rollback = `git revert` + delete `class-notes.db*` and restart. No down-migration is written.

## Open Questions

- Whether the registry later needs person-level contact fields (email) or a merge-two-persons screen — neither changes this schema, both are additive.
- Whether the pending list ("inscriptos sin comisión") gets its own page or lives as a section on the commissions page — a UI decision for `tasks.md`, not a schema one.
