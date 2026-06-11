## Why

The current UI lacks a unified aesthetic and relies on hardcoded styles that ignore global theme settings, causing visibility and consistency issues, particularly in dark mode. We need to implement a "Digital Sketchbook" design system using PaperCSS aesthetic concepts to provide a friendly, scholarly, and tactile experience.

## What Changes

- Implement a global "Digital Sketchbook" design system in `app.css` using CSS custom properties.
- Create atomic components (`Card.svelte`, `Button.svelte`, `Badge.svelte`) that encapsulate the "sketchy" look.
- Refactor existing components (`Sidebar.svelte`, table views) to use the new atomic components and CSS variables.
- Implement responsive design patterns (Table-to-Card on mobile).

## Capabilities

### New Capabilities

- `sketch-design-system`: Global CSS variables and atomic components to ensure consistent aesthetic.
- `responsive-tables`: Automatic table-to-card transformation on mobile devices.

### Modified Capabilities

- `navigation`: Sidebar layout refactored into a card-style persistent layout.

## Impact

- `src/app.css`: New CSS variables and global "sketchy" utility classes.
- `src/lib/components/`: Multiple new components (`Card`, `Button`, `Badge`) and refactors to existing ones.
- `src/routes/`: Updates to layout structure and view templates.
