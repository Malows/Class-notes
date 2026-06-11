## Context

The sidebar component (`Sidebar.svelte`) currently uses static CSS styles, including hardcoded background and border colors. This causes visibility issues in dark mode and fails to integrate visually as a separate UI element.

## Goals / Non-Goals

**Goals:**

- Replace static colors with PaperCSS/Global CSS variables.
- Ensure the sidebar adapts to dark mode.
- Improve visual separation (layout) of the sidebar.

**Non-Goals:**

- Do not redesign the entire navigation system.
- Do not introduce new third-party CSS libraries.

## Decisions

- **CSS Variables:** Use existing PaperCSS/App variables (like `var(--background-body)`, `var(--border-color)`) to ensure theme compatibility.
- **Sidebar Layout:** Apply a card-like style to the sidebar (border-radius, margin) to create visual separation.

## Risks / Trade-offs

- [Risk] CSS Variable incompatibility → Mitigation: Verify PaperCSS variable availability.
- [Risk] Layout shifts during transition → Mitigation: Test on various breakpoints.
