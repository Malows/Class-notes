# Proposal: Add Generic `PageWithAdd` Component

## Goal

Standardize the layout of pages that include a "create/add" button across the application to ensure UI consistency and reduce code duplication.

## Motivation

Currently, pages like `faculties/+page.svelte` manually implement the header with an "add" button using `CommonPage`. This leads to repetition and potential inconsistencies in styling and i18n usage for these buttons. By creating a reusable `PageWithAdd` component, we centralize this logic.

## Proposed Changes

1.  Create a new Svelte component `src/lib/components/layout/PageWithAdd.svelte`.
2.  Implement the component wrapping `CommonPage`.
3.  Include a prop for `onAdd` action and `addLabelKey` (defaulting to `common.add`).
4.  Refactor `src/routes/faculties/+page.svelte` (and other relevant pages) to use this new component.

## Impact

- **Consistency**: All creation buttons will share the same styling and i18n key.
- **Maintainability**: Centralized code for page layout with actions.
- **DX**: Reduced boilerplate in domain pages.
