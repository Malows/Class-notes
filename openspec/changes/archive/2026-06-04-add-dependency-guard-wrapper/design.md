## Context

Components currently handle empty states and redirects manually, leading to code duplication and inconsistent UX.

## Goals / Non-Goals

**Goals:**

- Provide a reusable `GuardWrapper` component.
- Centralize dependency checking logic.
- Guide users to prerequisite pages when data is missing.

**Non-Goals:**

- Complex dependency graphs (simple parent-child check is sufficient).

## Decisions

- **Pattern**: `GuardWrapper` receives a `condition` (boolean), `message`, and `redirect` props.
- **Implementation**: Uses Svelte slots to render content if the condition is met, otherwise renders a friendly empty-state message with a link.

## Risks / Trade-offs

- [Trade-off] Extra wrapper component in DOM. → Mitigation: Acceptable overhead for significant UX improvement and DRY code.
