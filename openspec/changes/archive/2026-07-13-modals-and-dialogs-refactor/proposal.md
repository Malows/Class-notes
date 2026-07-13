## Why

The current UI relies on inline forms for entity creation and native browser `confirm()` dialogs for deletions. This clutters the main views, breaks the "Sketchy" design aesthetic, and provides a fragmented user experience. Centralizing these interactions into custom, themed dialogs will improve focus and visual consistency.

## What Changes

- **Dialog Infrastructure**: Implementation of a `DialogBase` component using Svelte 5 snippets and PaperCSS styles.
- **Confirmation System**: Implementation of a themed `ConfirmDialog` to replace native `confirm()` calls.
- **Header Actions**: Update `CommonPage` to allow action buttons (like "+ Add") in the page header via snippets.
- **Faculty Management Refactor**:
  - Move the creation form from the main page to a unified Create/Edit modal.
  - Add an "Add Faculty" button to the header.
  - Implement a mode-based state management for modals.
  - Replace deletion confirmation with the new themed dialog.

## Capabilities

### New Capabilities

- `dialog-system`: Provides the base infrastructure for modal dialogs and standard confirmation flows across the application.

### Modified Capabilities

- `academic-hierarchy`: Update interaction scenarios for entity management (starting with Faculties) to specify modal-based creation and editing instead of inline forms.

## Impact

- **UI/UX**: Significant improvement in visual consistency and layout breathing room.
- **Components**: New reusable components in `src/lib/components/common/`.
- **Pages**: Refactoring of `src/routes/faculties/+page.svelte` and `src/lib/components/layout/CommonPage.svelte`.
- **Dependencies**: Uses Svelte 5 transitions (`fade`, `fly`).
