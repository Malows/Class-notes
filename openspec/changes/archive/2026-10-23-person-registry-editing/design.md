# Design

## Context

See `proposal.md` — Why. Constraints that shape the approach:

- `student-enrollment` is a main capability; the archived `person-registry-views` change explicitly made the registry read-only and put editing in the enrollment modal. This change reverses that decision, so the artifact trail should show a reversal, not a fresh idea.
- `personRepository.delete` **already** soft-deletes the person and their active enrollments in one transaction. `personService.delete` is wired to it. There is no route and no UI.
- There is no `POST /api/v1/persons`; `PUT /api/v1/persons/[id]` exists and is used only by the roster's edit path.
- The app's entity pages all follow the same pattern: `PageWithAdd` (an "Agregar" button) + `ModalManager<T>` + an entity modal + `ConfirmDialog`. `/persons` is the only entity page built without it.
- The roster already receives `person_id` per row (`EnrollmentWithPerson`), so linking to the person costs nothing.
- Soft delete everywhere (project rule): no entity is physically deleted, uniqueness indexes are partial on `deletedAt IS NULL`, and there is no restore UI anywhere in the app.

## Goals / Non-Goals

**Goals:**

- One owner per entity: the registry owns persons, the roster owns enrollments.
- Creating, editing and deleting a person without leaving the registry.
- Deleting through the existing soft-delete path, with the blast radius stated before confirming.
- No schema change, no migration, no repository change for delete.

**Non-Goals:**

- No restore/undelete UI for soft-deleted persons.
- No person merge, no bulk import into the registry.
- No change to the enrollment flows: creating from the roster's paste mode still creates the person as a side effect.
- No change to what "Quitar" does in a roster.

## Decisions

### D1. The registry owns the person; the roster owns the enrollment

```
ANTES                                    DESPUES
nomina  -> crea persona                  registro -> crea persona
        -> edita persona                 registro -> edita persona
        -> quita inscripcion             registro -> borra persona (soft)
                                         nomina   -> crea inscripcion
                                         nomina   -> quita inscripcion
```

This is the reason the change exists. It also removes a subtle oddity: the roster's "Editar" already edited the person globally (`PUT /persons/:id`), so a teacher renaming a student from one commission silently changed every other commission. Moving the action to a view that is *about* the person makes that scope visible.

### D2. Two thin routes over the existing service

```
POST   /api/v1/persons        { name, legajo? }  -> 201 { data: person }
                                                      400 missing name
                                                      409 legajo in use
GET    /api/v1/persons        q, limit, offset   -> list (unchanged)
GET    /api/v1/persons/:id                        -> detail (unchanged)
PUT    /api/v1/persons/:id    { name, legajo? }   -> detail (unchanged, now used by the registry)
DELETE /api/v1/persons/:id                        -> 204
                                                      400 invalid id
                                                      404 unknown person
```

`DELETE` calls `personService.delete`, which already soft-deletes the person and their active enrollments in one transaction. Nothing in the repository changes: the behaviour the spec now asks for is the behaviour that was already implemented but unreachable.

404 on delete for an unknown id (rather than a silent 204) matches how a missing person behaves in the detail view, and prevents the UI from reporting success for a row the user cannot see anymore.

### D3. One `PersonModal`, two entry points

Follows `FacultyModal`/`CommissionModal`: `DialogBase` + `ErrorSpan`, `mode: "create" | "edit"`, fields name and optional legajo.

- `/persons` — `PageWithAdd` with an "Agregar" button opening `mode="create"`; on success, reload the first page and notify.
- `/persons/[id]` — an "Editar" button opening the same modal with `mode="edit"`.

The 409 from the API is surfaced through `ErrorSpan` inside the modal (the pattern the other modals already use), not as a toast: the user is mid-form and the field that is wrong is still on screen.

### D4. Removing the roster's edit action, without stranding the user

Three edits, one intent:

- `StudentRow`: drop the "Editar" button; the name becomes a link to `/persons/{person_id}`.
- `StudentTable`: drop the `onEdit` prop entirely.
- `EnrollmentModal`: drop `mode`, `enrollment` and `onUpdatePerson`; it becomes create-only. The students page drops `handleUpdatePerson`, `modal.openEdit` and the now-unused `personService` import.

The name link is not decoration: without it, removing "Editar" leaves the roster as a dead end whose only exit is "Quitar". The link is also what the new spec scenario asks for ("the roster SHALL offer a way to reach the person's registry detail").

### D5. Delete UX states the blast radius

`ConfirmDialog` on `/persons/[id]` with a message naming the person and saying they will be removed from all their cursadas. Confirmation calls `DELETE`, then `goto("/persons")` — the detail page would otherwise render its not-found state, which reads as a failure.

No undo. Because soft delete has no restore surface anywhere in the app, the confirmation is the only safety net; that is why the message names the cursadas rather than asking a generic "¿Estás seguro?".

### D6. i18n moves rather than duplicates

- `persons.json` gains `new_title`, `edit_title`, `name_label`, `delete_confirm_title`, `delete_confirm_message`.
- `enrollments.edit_title` becomes unused (`EnrollmentModal` no longer edits) and is removed from EN and ES.
- `students.*` keeps owning the enrollment form's labels; `persons.*` owns the person form's. Two small label pairs are duplicated on purpose: the namespaces describe different flows and should be able to drift.

## Risks / Trade-offs

- **Deleting a person leaves their deliveries behind.** The rows stay, the enrollments they belong to are soft-deleted, so the deliveries become unreachable through any roster or overview. Consistent with the app's soft-delete rule and recoverable only in the database. Accepted.
- **Legajo reuse after delete starts a new history.** A returning student deleted by mistake becomes a new person with new enrollments; their old deliveries stay attached to the deleted enrollment. Mitigation: the confirm message says the legajo becomes available again, and the guidance for "estudiante que dejó de cursar" is *Quitar* the enrollment, not delete the person.
- **No undo.** Soft delete without a restore surface is final from the user's point of view. Mitigation: explicit confirm text; a restore flow is a candidate follow-up.
- **Two creation paths with different failure modes.** The registry modal rejects a duplicate legajo with 409; the roster's paste mode silently reuses the existing person. Intentional (bulk paste must not abort on one duplicate) but worth a note in the UI copy: the registry form is for deliberate single creation.
- **Muscle memory.** A teacher used to renaming a student from the roster now has to go to the registry. The name link is the discoverability bridge.
- **`DELETE` before `GET` on the detail** — a stale tab deleting an already-deleted person gets 404, which the UI can show as "already deleted" rather than an error. Handled by the same not-found state.

## Migration Plan

No schema change, no data migration: two routes, one modal, one removal, i18n. Ships in a single commit series gated by `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`.

## Open Questions

- Whether to add a restore action for soft-deleted persons (and a "ver borrados" filter) later. Additive, does not change this design.
