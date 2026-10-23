# Design

## Context

See `proposal.md` — Why. Constraints that shape the approach:

- `enrollments` is the cursada anchor (`subject_period_id NOT NULL`, `commission_id` nullable) and `assignments` hangs off `subject_period_id`. Both repositories already expose what attendance needs: `enrollmentRepository.getRoster(commissionId)`, `getByCursada(subjectPeriodId)` and `assignmentRepository.getAll(subjectPeriodId)`.
- `deliveries` is the closest precedent: PK `(assignment_id, enrollment_id)`, upsert that revives a soft-deleted row, one row per pair. Attendance follows the same shape.
- The overview grid (`src/lib/client/components/grids/overview/`) already renders "rows = enrollments, columns = assignments" as a CSS grid with `subgrid` rows; attendance reuses that layout, not the delivery-specific cell.
- There is no gesture code anywhere in the client today, and no dependency that provides one.
- Migrations in this project only run when the database is created from scratch (the initializer checks for the `faculties` table), so any schema change is applied by deleting `class-notes.db*` and reseeding.

## Goals / Non-Goals

**Goals:**

- A state per (TP, enrollment) that can distinguish present, absent and not-taken.
- Two readable scopes: one commission (where attendance is taken) and the whole cursada (the global view).
- Guest attendance that is structurally impossible to record across cursadas.
- A take mode that works one-handed on a phone, with a keyboard path that is not an afterthought.

**Non-Goals:**

- No sessions: one state per TP, not per class date.
- No attendance thresholds or "regularidad" rules.
- No offline queue, no background sync.
- No automatic absence or bulk import from a file.
- No changes to the enrollment, roster or assignment flows.

## Decisions

### D1. One state per TP (model A), with `recorded_on` as a timestamp

`attendances` has PK `(assignment_id, enrollment_id)`. `recorded_on` answers "when was this value set", not "which class is this". Taking attendance for the same TP twice overwrites and moves the date.

```
attendances
+---------------+-------------+---------+-------------+---------------+-------------------+
| assignment_id | enrollment_id| status  | recorded_on | commission_id | subject_period_id |
+---------------+-------------+---------+-------------+---------------+-------------------+
        PK (assignment_id, enrollment_id)
        status: PRESENT | ABSENT
        recorded_on: YYYY-MM-DD (local)
        commission_id: where it was taken (differs from the enrollment's own => guest)
        subject_period_id: denormalized, so the same-cursada rule is enforceable (D4)
        deletedAt: soft delete
```

Accepted cost: a TP taught in two classes keeps only the last value. The escape hatch is cheap and documented — if sessions are ever needed, a synthetic session per `(assignment, commission, recorded_on)` can be created and the rows repointed, without touching the UI contract. Sessions were explicitly rejected for now: they multiply the take-mode flow (pick TP *and* date) and the grid would stop being "one cell per TP".

### D2. Tri-state through row absence

```
no row      ->  [ ]   not taken        (the swipe "up"/skip leaves it like this)
PRESENT     ->  [v]
ABSENT      ->  [X]   (a row exists: someone decided)
```

Writing `ABSENT` is what makes "nobody came" different from "I have not taken attendance". A nullable `status` column or a single `attended` boolean would collapse those two states and make every summary lie.

Unmarking is a soft delete, and the upsert revives the row, exactly like `deliveryRepository.save`.

### D3. `commission_id` on the record is what makes guests work

An attendance row is keyed by the enrollment, so the student's own commission is always derivable. The extra `commission_id` says **where it was taken**, and only differs for guests.

That single column makes both grids correct without duplicating anything:

```
Comision A (donde tomo asistencia)          Comision B (donde cursa Beto)
        TP1   TP2                                   TP1   TP2
 Ana    [v]   [ ]                            Beto  [v]   [ ]   <- misma fila
 Beto*  [v]   [ ]   <- invitado
 Caro   [x]   [ ]
```

- Commission A's grid includes Beto because he has a record taken there.
- Commission B's grid shows Beto's TP1 as present because the cell is looked up by `(assignment, enrollment)`, not by commission.
- The cursada grid has one row per enrollment, so Beto appears once even though two commissions "see" him.

Row set of a commission grid = roster of the commission ∪ enrollments with a record taken in that commission.

### D4. Same-cursada enforced by composite foreign keys

`subject_period_id` is denormalized on purpose — it is both the query key for the cursada grid and the target of two composite FKs:

```
attendances (assignment_id, subject_period_id) -> assignments (id, subject_period_id)
attendances (enrollment_id, subject_period_id) -> enrollments (id, subject_period_id)
```

SQLite enforces this if the parents have a unique index on the pair, so the migration adds `UNIQUE (id, subject_period_id)` to `assignments` and `enrollments`. The alternative — validating in the repository — is what the rest of the app does for commission assignment, but here a wrong row silently mixes subjects in a grid, so the database is the right place to refuse it. The cost is one extra column and two indexes.

### D5. Two grid scopes, one take mode

```
.../periods/{year}/{semester}/attendance                  de la cursada (todas las comisiones)
.../commissions/{slug}/attendance                          de la comision (nomina + invitados)
.../commissions/{slug}/attendance/take?assignment_id=X     tomar asistencia (siempre por comision)
```

Reading happens at two scopes; **taking** always belongs to one commission, because `commission_id` on the record needs a single answer. The cursada grid is read-only apart from inline cell edits.

`AttendanceGrid.svelte` mirrors the overview grid layout (`grid-template-columns` + `subgrid` rows) instead of generalizing `OverviewGrid`: the overview is tied to deliveries, links and the semaphore legend, and copying ~40 lines of layout is cheaper than making one component serve two cell semantics.

### D6. Take mode: pointer events, keyboard, buttons, undo

- One card per student, a counter (`3 / 24`) and the person's name plus legajo.
- Gestures use `pointerdown`/`pointermove`/`pointerup` with `setPointerCapture`, not `touchstart`: one code path for touch, pen and mouse. The card sets `touch-action: none` so vertical scrolling does not fight the gesture.
- Threshold: `max(80px, 20% of card width)`; axis dominance decides the gesture (`|dx| > |dy|` → horizontal, else vertical).
- `right → present`, `left → absent`, `up → skip`. `down` does nothing on purpose (no destructive gesture without a label).
- Keyboard: `ArrowRight`, `ArrowLeft`, `ArrowUp`; `Ctrl/Cmd+Z` or `Backspace` undoes. The three decisions are also visible buttons, so the feature never depends on a gesture.
- Undo is a stack of `{ enrollmentId, previous: status | null }`. Undo writes the previous value back (or unmarks) and returns to that card, so it costs one request, not a client-side rollback.
- Visual feedback during the drag: the card translates, tints green/red/neutral and shows the pending label before release.

### D7. One request per decision, plus a bulk endpoint

Each decision is a `PUT` (or `DELETE` for unmark) issued immediately, with optimistic UI: the card advances without waiting, and a failed request is surfaced as a toast while the row keeps the last server-confirmed value on reload. A queue would be the right answer for flaky networks; it is explicitly out of scope, and the take mode is designed so a lost decision is visible in the grid afterwards.

`POST /attendance/bulk` exists for the two cases that are naturally batched: "mark every student present" before starting, and applying the decisions of a finished run in one shot if the user prefers it. Body: `{ assignment_id, commission_id, entries: [{ enrollment_id, status }] }`; the server derives `subject_period_id` from the assignment.

### D8. Summary semantics

- Per row: `present` count over **assignments that have a record for that student**. `3 / 5` means 3 present out of 5 taken, not out of 12 TPs.
- Per column: count of `PRESENT`; a column with no records at all renders an empty state, not `0`.
- Unmarked is never counted as absent, anywhere.

### D9. Guest picker

In take mode, a button opens a picker that searches persons **already enrolled in the same cursada** who are not in this commission's roster (the data comes from `getByCursada` minus the roster). Picking one appends a card at the end of the run, flagged as a guest; the record is written with this commission's id.

This matches the intent stated for the feature ("al final quiero poder agregar asistencia de estudiantes de otra comisión"): guests are deliberate additions, not part of the walked roster.

### D10. i18n and accessibility

New `attendance.json` namespace (EN + ES). The card exposes `aria-live` for the current student and progress, and each action has a real button, so a screen reader or keyboard user completes the same flow without gestures.

### D11. The cursada roster belongs to the academic hierarchy

```
GET /api/v1/periods/:id/subjects/:subjectId/students
```

It sits under the existing `periods/:id/subjects` family, so a client that already resolved the period appends one segment. It returns the subject, the period, the cursada's commissions and one row per enrollment with name, legajo and the commission (id, name and slug).

**Why not reuse `/enrollments?subject_period_id=`**: that payload carries `commission_id` but neither the commission's name nor its slug, so every consumer has to resolve labels from a second source. The roster is a read of the academic structure — who is taking this subject right now — so it belongs next to the structure, not next to the enrollment CRUD.

**Overlap with the attendance grid, on purpose**: the roster answers "who is in this cursada, with which commission"; `GET /attendance?subject_period_id=` answers "and what is their attendance state", returning rows and cells in one payload so the grid renders in one request. Both read the same repository projection internally, so they cannot disagree; the duplication is in the HTTP surface, not in the data. Recorded here so nobody "de-duplicates" it later without knowing why.

Students without a commission appear with null commission fields — they are enrolled in the subject and waiting for a commission, which is a real state and exactly what the pending list is built on.

## Risks / Trade-offs

- **A TP taught twice loses the first class.** Accepted by design (D1). Mitigation: the date is visible on the cell tooltip, and the session migration path is documented for when it matters.
- **Migrations only run on a fresh database.** The new table requires deleting `class-notes.db*`, which is fine today but would destroy real attendance later. Recommended follow-up: a `schema_migrations` tracking table so migrations can be applied incrementally before attendance is used for real. No attendance tasks in this change are blocked by that, hence the explicit warning rather than silent absorption.
- **A guest appears in two grids.** Intentional and consistent (D3), but a teacher may wonder why Beto is in both. Mitigation: the guest row is labelled with its origin commission.
- **Optimistic writes on a bad network.** A decision can be lost between the card and the server. Mitigation: the grid is the source of truth after the run, failures surface as a toast, and the bulk endpoint gives one retry unit.
- **Swipe vs. page scroll on mobile.** `touch-action: none` on the card, axis dominance and a threshold; the buttons remain the fallback.
- **Attendance volume.** A cursada of 40 students × 12 TPs = 480 rows, trivial for SQLite; the grid query is one join keyed by `subject_period_id`/`commission_id`.
- **Soft-deleted persons keep their attendance rows.** Unreachable from any grid, consistent with the rest of the app.

## Migration Plan

1. New migration: create `attendances`, add `UNIQUE (id, subject_period_id)` to `assignments` and `enrollments`, then the composite FKs on `attendances`.
2. No backfill: absence of rows is the correct initial state for every existing TP.
3. Local dev must delete `class-notes.db*` so the initializer reapplies migrations; the seed does not change.
4. Rollback: additive only — dropping the table and the two unique indexes is safe, and no other table references `attendances`.

## Open Questions

- Whether "present" should later distinguish late arrival or justified absence. Adding values to a text enum costs no migration, so it can wait for a real need.
- Whether the per-student summary should surface a percentage against all TPs (not just the taken ones) once a grading/regularity rule exists.
