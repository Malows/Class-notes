# Tasks

## 1. Endpoints

- [x] 1.1 Add `POST /api/v1/persons` creating a person from `{ name, legajo? }`, returning 201, 400 when the name is missing and 409 on `LegajoConflictError`; verify with route tests covering the three statuses.
- [x] 1.2 Add `DELETE /api/v1/persons/[id]` delegating to `personService.delete`, returning 204, 400 for an invalid id and 404 when the person does not exist; verify with route tests covering the three statuses.

## 2. Servicio de cliente

- [x] 2.1 Add `create(name, legajo?)` and `remove(id)` to `src/lib/client/services/person.service.ts`; verify with a service test that `create` posts to `/persons` and `remove` deletes `/persons/:id`.

## 3. Registro: crear, editar, borrar

- [x] 3.1 Create `PersonModal.svelte` with `mode: "create" | "edit"`, name and optional legajo fields and an inline error area; verify with a render test that it submits the typed values and that a rejected legajo renders the error instead of closing.
- [x] 3.2 Wire `PageWithAdd` + `ModalManager` + `PersonModal` on `/persons` for creation, reloading the list and notifying on success; verify with a page render test that the add button opens the modal and a successful create triggers a list reload.
- [x] 3.3 Add the "Editar" action on `/persons/[id]` opening the same modal in edit mode and reloading the detail on success; verify with a page render test that submitting a new name updates the rendered name.
- [x] 3.4 Add the "Borrar" action on `/persons/[id]` with a `ConfirmDialog` that names the person and states that they will be removed from all their cursadas, navigating back to `/persons` on success; verify with a page render test that the confirmation calls the delete endpoint and leaves the detail view.

## 4. Quitar la edición de la nómina

- [x] 4.1 Remove the `onEdit` prop and the "Editar" button from `StudentTable`/`StudentRow`, and make the person name a link to `/persons/{person_id}`; verify the updated row and table tests assert the link and the absence of the edit action.
- [x] 4.2 Make `EnrollmentModal` create-only by removing `mode`, `enrollment` and `onUpdatePerson`, and drop `handleUpdatePerson`, `modal.openEdit` and the `personService` import from the students page; verify `pnpm check` passes and the students page render test still passes.

## 5. i18n e integración

- [x] 5.1 Add the create/edit/delete keys to `persons.json` in EN and ES, remove the now-unused `enrollments.edit_title` from both languages, and verify `pnpm validate:i18n` passes.
- [x] 5.2 Run `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`, fixing every failure.
- [x] 5.3 Smoke test against a fresh database: create a person from the registry (zero cursadas), edit the name and confirm it changes in the roster of a cursada where they are enrolled, then delete the person and confirm they disappear from both the registry and the roster while the database row remains soft-deleted.
