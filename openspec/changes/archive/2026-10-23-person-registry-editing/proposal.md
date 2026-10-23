# Proposal

## Why

The registry is read-only and the only way to edit a person is the enrollment modal of a commission, which means the commission roster owns two entities at once: the person and the enrollment. That split is what the person/enrollment refactor was meant to end. Editing from the registry makes each surface own exactly one entity — the registry owns persons, the roster owns enrollments — and gives the registry the create/delete it needs to be self-sufficient.

## What Changes

- **BREAKING** (behavioural reversal) — `Person Cursada History` stops being read-only: the registry gains person management instead. The archived decision "editing a person SHALL remain available only from the enrollment flow of a commission" is reversed by this change.
- Add `POST /api/v1/persons` to create a person (name + optional legajo), rejecting a legajo already in use with 409.
- Add `DELETE /api/v1/persons/[id]`: a **soft delete** of the person and their active enrollments, reusing `personRepository.delete` as it already behaves.
- Add a `PersonModal` (name + legajo) used for both create and edit, opened from an "Agregar" action on `/persons` and an "Editar" action on `/persons/[id]`.
- Add a "Borrar" action on `/persons/[id]` with a confirmation that states the blast radius: the person is removed from every cursada.
- Remove person editing from the commission roster: the row loses its "Editar" action, `EnrollmentModal` becomes create-only, and the students page loses `handleUpdatePerson`.
- Make the person name in the roster link to `/persons/{person_id}`, so removing the edit action does not leave the roster without a path to the person.
- Roster removal ("Quitar") is unchanged: it still removes the enrollment and never the person.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `student-enrollment`: `Person Cursada History` is no longer read-only, and a new `Person Management from the Registry` requirement covers creating, editing and soft-deleting persons from the registry.

## Impact

- **Server**: `POST /api/v1/persons` (new) and `DELETE /api/v1/persons/[id]` (new), both thin over the existing `person.service`; no repository or schema changes — `personRepository.delete` already soft-deletes the person and their active enrollments in one transaction.
- **Client**: new `PersonModal.svelte`; `/persons` gains `PageWithAdd` + `ModalManager` + `ConfirmDialog` wiring; `/persons/[id]` gains edit and delete actions; `person.service.ts` gains `create` and `remove`.
- **Roster**: `StudentRow.svelte` (edit action out, name becomes a link), `StudentTable.svelte` (drops `onEdit`), `EnrollmentModal.svelte` (create-only), `commissions/[commission]/students/+page.svelte` (drops `handleUpdatePerson`, `modal.openEdit` and the person service import).
- **i18n**: `persons.json` gains create/edit/delete keys in EN and ES; `enrollments.edit_title` becomes unused and is removed.
- **Tests**: route tests for create (201/409) and delete (204/404); `StudentRow`/`StudentTable` tests updated for the removed edit action and the new link; persons page render tests for create, edit and delete flows.
- **Data**: nothing migrates. Soft-deleted persons free their legajo (partial unique index), and their deliveries keep their rows but stop being reachable through any roster — consistent with how the rest of the app treats soft delete.
