## 1. Global Styles Fixes

- [x] 1.1 Update `--muted-color` and status variables in `app.css` for contrast.
- [x] 1.2 Verify contrast using Lighthouse/DevTools in both themes.

## 2. Component Refactoring

- [x] 2.1 Fix heading hierarchy in `DashboardPending.svelte` and `DashboardStats.svelte` (h4 -> h3).
- [x] 2.2 Correct Breadcrumbs active state color.
- [x] 2.3 Add `aria-label` to Sidebar toggle and other icon-only buttons.

## 3. Form A11y Fixes

- [x] 3.1 Refactor `DeliveryForm.svelte` to fix label/id associations for all inputs.
- [x] 3.2 Ensure unique IDs for form elements using a simple counter or crypto.randomUUID (if available in client).

## 4. Final Audit

- [x] 4.1 Run Lighthouse again to verify 100/100 score.
- [x] 4.2 Check remaining Svelte compiler warnings.
