## Context

To achieve a reactive and performant frontend, we will transition from component-level fetching to a store-based architecture.

## Goals / Non-Goals

**Goals:**

- Centralize resource state in `svelte/store` writable stores.
- Implement lazy loading for initial data fetching.
- Implement push mutations for instant UI updates (add/delete).

**Non-Goals:**

- Full state management rewrite (only API resources).

## Decisions

- **Store Pattern**: Use a custom `writable` factory for each resource (e.g., `facultiesStore`).
- **Lazy Loading**: `load()` method in store checks a local `loaded` flag.
- **Push Mutations**: `add()`, `remove()`, `update()` methods modify the store state after successful API service calls.

## Risks / Trade-offs

- [Risk] Store state getting out of sync with backend. → Mitigation: Ensure mutation methods in stores are strictly coupled with service call success.
- [Trade-off] Boilerplate for each resource store. → Mitigation: Create a generic base store or factory function if boilerplate becomes excessive.
