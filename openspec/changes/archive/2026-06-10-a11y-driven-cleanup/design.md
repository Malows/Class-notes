# Design: Accessibility-First Refactor

## 1. Color Contrast Strategy

Adjust CSS Custom Properties in `src/app.css` to meet WCAG AA (4.5:1 for normal text, 3:1 for large text/UI components):

- `text-muted`: Darken in light mode, lighten in dark mode.
- `warning` badge colors: Use a more readable gold/brown instead of bright yellow for text.
- `Breadcrumbs`: Ensure active state contrast.

## 2. Semantic Hierarchy

Standardize heading levels:

- Page Title: `h2` (already used).
- Section Titles (Cards): `h3` (currently using `h4` or `span` inconsistently).
- Subsection labels: `h4` or bold text.

## 3. Form Accessibility

- Implement a `Label` snippet or utility to ensure `for`/`id` mapping is automatic and unique.
- Refactor `DeliveryForm` to use valid HTML structure for radio groups.

## 4. Component Patterns (Svelte 5)

- Use `aria-label` for buttons containing only icons.
- Ensure `StatItem` and `Badge` components have appropriate ARIA roles where necessary.
