## 1. Core Dialog Infrastructure

- [x] 1.1 Create `src/lib/components/common/DialogBase.svelte` with Svelte 5 snippets and PaperCSS styling.
- [x] 1.2 Create `src/lib/components/common/ConfirmDialog.svelte` using `DialogBase`.
- [x] 1.3 Update `src/lib/components/layout/CommonPage.svelte` to include the `extra` snippet in the header.

## 2. Faculty Management Refactor

- [x] 2.1 Create `src/lib/components/FacultyModal.svelte` to handle both Create and Edit modes.
- [x] 2.2 Update `src/routes/faculties/+page.svelte` to implement `modalMode` state.
- [x] 2.3 Move "+ Add Faculty" logic to the `CommonPage` header snippet.
- [x] 2.4 Remove the inline creation `card` from `src/routes/faculties/+page.svelte`.
- [x] 2.5 Replace native `confirm()` and `alert()` with `ConfirmDialog` and themed feedback in `src/routes/faculties/+page.svelte`.

## 3. Verification and Cleanup

- [ ] 3.1 Verify accessibility (Esc key, focus trapping) in `DialogBase`.
- [ ] 3.2 Ensure responsive behavior (modals should be readable on mobile).
- [x] 3.3 Remove `src/lib/components/EditModal.svelte` if no longer used.
- [x] 3.4 Verify unit tests for faculties still pass with the new modal-based flow.
