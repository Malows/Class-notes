# Students Modal & PageWithAdd Migration Plan

## Objective
Standardize the **Students** list page to use SvelteKit's adaptive `<PageWithAdd>` container and a unifed, highly responsive `<StudentModal>` Svelte component. This refactoring unifies both single-student creation/editing and bulk roster copy-pasting inside a single, elegant modal layout, while introducing `<ConfirmDialog>` for deletion confirmation and ensuring E2E testing tag consistency.

## Key Files & Context
- **Students Page**:
  - `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/[period_id]/commissions/[commission_id]/students/+page.svelte`
- **Student Modal**:
  - `src/lib/components/modals/StudentModal.svelte`

## Implementation Plan

1. **Refactor `StudentModal.svelte`**:
   - Support a tabbed structure in `'create'` mode: "Single Student" and "Roster Paste".
   - In "Single Student" mode, display inputs for name and external ID.
   - In "Roster Paste" mode, display a multiline `<textarea>` for pasting list names.
   - Set the confirmation action button color to `btn-secondary`.
   - Expand `onSave` signature: `onSave: (name: string, externalId: string, id?: number, bulkNames?: string[]) => void`.

2. **Refactor `/students/+page.svelte`**:
   - Import `ModalManager`, `<PageWithAdd>`, and `<ConfirmDialog>`.
   - Instantiate `const modal = new ModalManager<Student>();`.
   - Wrap the main template layout with `<PageWithAdd title={$t('students.manage_students_title')} onAdd={() => modal.openCreate()}>`.
   - Move the back-to-commissions link underneath the header inside `PageWithAdd`.
   - Implement `handleSave(name, externalId, id?, bulkNames?)`:
     - If `bulkNames` is provided, execute `studentsStore.create(commissionID, bulkNames)`.
     - Else if `id` is provided, execute `studentsStore.updateItem(id, name)`.
     - Else (single creation), execute `studentsStore.create(commissionID, [name])`.
     - Close the modal upon success.
   - Implement `handleDelete()` for `<ConfirmDialog>` to process the reactive modal target student deletion.
   - Update `<StudentTable>` to use wrapped arrow function handlers:
     - `onEdit={(student) => modal.openEdit(student)}`
     - `onDelete={(student) => modal.openDelete(student)}`
   - Render `<StudentModal>` and `<ConfirmDialog>` at the bottom of the page.

3. **Verification**:
   - Run `pnpm test run` to ensure all 78 tests pass successfully.
   - Run `pnpm build` to verify SvelteKit app compilations.
   - Keep all files modified on disk but completely unstaged/uncommitted as directed.
