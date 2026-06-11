## Context

The application needs a cohesive design system that reflects the "Digital Sketchbook" philosophy. Current styles are fragmented. We will adopt CSS Custom Properties for theme management and PaperCSS aesthetic primitives.

## Goals / Non-Goals

**Goals:**

- Unify UI components under a new "sketch" aesthetic.
- Implement CSS variables for all aesthetic parameters (shadows, radii, border styles).
- Ensure 100% theme (light/dark) consistency.
- Implement responsive table-to-card refactor.

**Non-Goals:**

- Change the core application functionality.
- Add new external CSS frameworks (Stick to PaperCSS).

## Decisions

- **CSS Variables:** All "sketch" parameters (border-radius, border weight, shadow offsets) will be defined in `:root` and overridden in `.dark` in `app.css`.
- **Atomic Components:** Create `Card`, `Button`, and `Badge` wrappers that enforce the new aesthetic.
- **Table Transformation:** Tables will use a conditional rendering strategy: `<table>` on desktop, set of `<Card>` components on mobile.

## Risks / Trade-offs

- [Risk] Performance overhead of conditional rendering for tables → Mitigation: Use Svelte's efficient reactivity to minimize DOM re-renders.
- [Risk] CSS Variable scope issues → Mitigation: Define all variables on `:root` for global access.
