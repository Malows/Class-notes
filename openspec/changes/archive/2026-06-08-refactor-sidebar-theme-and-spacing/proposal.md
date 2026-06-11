## Why

The sidebar currently has hardcoded colors (`#fff`, `#f8f8f8`) that ignore the application's theme (light/dark), causing visibility and contrast issues in dark mode. Additionally, the sidebar lacks sufficient visual separation from the main content and navigation header, breaking the expected aesthetic consistency.

## What Changes

- Modify `src/lib/components/Sidebar.svelte`:
  - Replace hardcoded background and border colors with PaperCSS variables.
  - Apply `margin` and `border-radius` to make the sidebar look like a distinct card element.
  - Ensure hover/active states use theme-aware variables.

## Capabilities

### New Capabilities

<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

- `sidebar-theming`: Improves visibility and contrast in light/dark modes by using theme-aware CSS variables.

### Modified Capabilities

<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->

## Impact

- `src/lib/components/Sidebar.svelte`: CSS styles will be refactored.
