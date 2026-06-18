# Commissions & Assignments Modal Migration Plan

## Objective

Standardize both the **Commissions** and **Assignments** routes to match the unifed, modular pattern used on the faculties, subjects, and periods pages. This involves replacing their inline creation forms with modal-driven forms, wrapping the pages with `<PageWithAdd>`, integrating the reactive `ModalManager`, and introducing `<ConfirmDialog>` for handling deletions.

## Key Files & Context

- **Commissions**:
  - `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/[period_id]/commissions/+page.svelte`
  - `src/lib/i18n/es/commissions.json` & `en/commissions.json`
- **Assignments**:
  - `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/[period_id]/assignments/+page.svelte`
  - `src/lib/i18n/es/assignments.json` & `en/assignments.json`

## Implementation Plan

1. **i18n Enhancements**:
   - Add `"confirm_delete_title"` and `"confirm_delete_message"` (with `{{name}}` or `{{title}}` placeholder interpolation) to both commissions and assignments translation JSON files in both Spanish and English.

2. **Commissions Route Refactor**:
   - Import `ModalManager`, `<PageWithAdd>`, and `<ConfirmDialog>`.
   - Instantiate `const modal = new ModalManager<Commission>();`.
   - Wrap the main template layout with `<PageWithAdd title={$t('commissions.manage_commissions_title')} onAdd={() => modal.openCreate()}>`.
   - Move the back-to-periods link underneath the header inside `PageWithAdd`.
   - Implement a unifed `handleSave(name, id?)` callback that detects mode and dispatches either `create` or `updateItem` on `commissionsStore`, closing the modal upon completion.
   - Implement `handleDelete()` for `<ConfirmDialog>` to process the reactive modal target commission deletion.
   - Update `<CommissionTable>` to use wrapped arrow function handlers:
     - `onEdit={(commission) => modal.openEdit(commission)}`
     - `onDelete={(commission) => modal.openDelete(commission)}`
   - Render `<CommissionModal>` and `<ConfirmDialog>` at the bottom of the page.

3. **Assignments Route Refactor**:
   - Import `ModalManager`, `<PageWithAdd>`, and `<ConfirmDialog>`.
   - Instantiate `const modal = new ModalManager<Assignment>();`.
   - Wrap the main template layout with `<PageWithAdd title={$t('assignments.manage_assignments_title')} onAdd={() => modal.openCreate()}>`.
   - Move the back-to-periods link underneath the header inside `PageWithAdd`.
   - Implement a unifed `handleSave(title, id?)` callback that detects mode and dispatches either `create` or `updateItem` on `assignmentsStore`, closing the modal upon completion.
   - Implement `handleDelete()` for `<ConfirmDialog>` to process the reactive modal target assignment deletion.
   - Update `<AssignmentTable>` to use wrapped arrow function handlers:
     - `onEdit={(assignment) => modal.openEdit(assignment)}`
     - `onDelete={(assignment) => modal.openDelete(assignment)}`
   - Render `<AssignmentModal>` and `<ConfirmDialog>` at the bottom of the page.

## Verification & Testing

1. Run `pnpm test run` to ensure all 78 tests pass successfully.
2. Run `pnpm build` to verify SvelteKit app compilations.
3. Keep all files modified on disk but completely unstaged/uncommitted as directed.
