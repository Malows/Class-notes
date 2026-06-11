# Proposal: Accessibility and Semantic Cleanup

## 1. Context

A Lighthouse audit revealed issues in color contrast (Breadcrumbs, Status Badges) and heading hierarchy. Additionally, Svelte compiler warnings persist regarding form label associations and reactive state handling in components like `DeliveryForm.svelte`.

## 2. Goals

- Improve A11y score to 100/100.
- Resolve all Svelte compiler warnings related to accessibility.
- Ensure WCAG 2.1 AA compliance for color contrast across light and dark modes.

## 3. Scope

- **Styles:** `src/app.css` (contrast variables).
- **Components:** `Breadcrumbs.svelte`, `DeliveryForm.svelte`, `DashboardStats.svelte`, `DashboardPending.svelte`.
- **Layout:** `Sidebar.svelte` (aria-labels and interaction).

## 4. Risks

- Visual changes to "sketchy" aesthetic colors might slightly alter the look to achieve contrast.
- Refactoring headers might affect some component-scoped styles.
