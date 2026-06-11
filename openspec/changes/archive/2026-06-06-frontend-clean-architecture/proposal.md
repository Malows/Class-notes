## Why

Current Svelte components mix data fetching, API logic, and UI rendering, leading to tightly coupled code that is hard to test and maintain. Introducing an architectural pattern with services, stores, and pure components will modularize the frontend, improve reusability, and simplify state management.

## What Changes

- **Services**: Centralized API calls.
- **Stores**: Shared reactive state.
- **Components**: Separated into:
  - **Pure (Presentational)**: Only handle props and events.
  - **Auxiliary (Smart)**: Handle state and service integration.

## Capabilities

### New Capabilities

- `frontend-architecture`: Modular frontend structure.
- `reactive-state`: Managed state via Svelte stores.

## Impact

- **Maintenance**: Easier to change API endpoints or UI independently.
- **Testing**: Pure components are trivial to test.
