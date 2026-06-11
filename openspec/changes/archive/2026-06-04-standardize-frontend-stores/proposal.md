## Why

Currently, components fetch data on mount, leading to redundant API calls and potential state fragmentation. We need a centralized store strategy to improve performance (caching) and user experience (immediate UI updates).

## What Changes

- Implement a standard Svelte store pattern for all API resources in `frontend/src/lib/stores/`.
- Strategy: **Lazy Loading** (fetch on first access) and **Push Mutations** (update local store state after successful API mutations).
- Update components to consume data from stores instead of services directly.

## Capabilities

### New Capabilities

- `store-pattern-standardization`: Implementing a unified store pattern for lazy loading and push mutations.

### Modified Capabilities

- `frontend-inline-validation`: (Needs coordination with store updates to ensure validation happens before/during push).

## Impact

- Frontend: All components consuming API data need refactoring to use stores.
- Maintenance: Simplifies state management across the app.
