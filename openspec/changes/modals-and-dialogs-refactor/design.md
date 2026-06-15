## Context

The application follows a "Sketchy" aesthetic using PaperCSS. Currently, entity creation is handled by inline forms (cards) that occupy significant vertical space. Deletions use the native browser `confirm()` dialog, which is functional but inconsistent with the custom UI theme.

## Goals / Non-Goals

**Goals:**

- Provide a standardized, themed modal system.
- Move entity creation forms from the main page body to modals.
- Replace native `confirm()` with a custom themed confirmation dialog.
- Standardize header actions (like "Add") across pages.

**Non-Goals:**

- Refactoring the entire application's forms in one go (starting with Faculties).
- Adding complex multi-step wizards.

## Decisions

### 1. Reusable DialogBase Component

We will implement `src/lib/components/common/DialogBase.svelte` using Svelte 5 snippets.

- **Rationale**: Snippets (`{@render ...}`) provide maximum flexibility for content layout while maintaining a consistent "Sketchy" wrapper (backdrop, centering, card styles).
- **Alternatives**: Using slots (deprecated in Svelte 5) or passing content as raw strings (unflexible).

### 2. Mode-Based Modal State

Pages will manage their modal state using a union type: `type ModalMode = 'create' | 'edit' | 'delete' | null`.

- **Rationale**: This prevents "z-index wars" and ensures that only one modal context is active at a time. It also simplifies the logic by having a single source of truth for visibility.

### 3. Unified Entity Modals

Instead of separate `CreateFacultyModal` and `EditFacultyModal`, we will use a single `FacultyModal` that adapts its title and submit logic based on the `mode` and `item` provided.

- **Rationale**: Entity forms (Creation vs. Editing) usually share 90% of the same fields. This reduces boilerplate and maintenance.

### 4. CommonPage Action Snippet

Update `src/lib/components/layout/CommonPage.svelte` to include an `extra` snippet in its header.

- **Rationale**: This follows the established pattern of separating layout from content, allowing pages to inject their specific action buttons (like "+ Add Faculty") without breaking the header's layout consistency.

## Risks / Trade-offs

- **[Risk] Accessibility (a11y)** → **Mitigation**: Ensure `DialogBase` handles focus trapping and "Esc" key to close.
- **[Risk] Backdrop collisions** → **Mitigation**: Use a high `z-index` and ensure only one `DialogBase` is rendered at a time via the `modalMode` state.
