# Proposal: Add Component Unit Tests

## 1. Context

The project currently lacks unit test coverage for core UI components, including common elements, layout components, and data tables. Adding these tests is crucial for maintaining stability during refactors.

## 2. Goals

- Achieve comprehensive unit test coverage for all components in:
  - `src/lib/components/common/**`
  - `src/lib/components/layout/**`
  - `src/lib/components/tables/PeriodTable.svelte`
- Use Vitest and `@testing-library/svelte` to verify component rendering, interaction, and state handling.

## 3. Scope

- **Common:** Badge, Button, Card, ResponsiveTable, StatItem.
- **Layout:** NavBar, Sidebar (and subcomponents), ClassNoteFooter.
- **Tables:** PeriodTable.

## 4. Risks

- Highly interactive components (like Sidebar/ResponsiveTable) require careful mocking of stores or context.
- UI changes might require frequent test updates if not abstracted correctly.
