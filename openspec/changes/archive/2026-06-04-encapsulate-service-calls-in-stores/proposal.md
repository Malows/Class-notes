## Why

Components currently rely on both `service` and `store` modules, leading to scattered logic and leaky abstractions. We need to encapsulate all service calls within the stores so that components only interact with the application state.

## What Changes

- Move all `service` calls inside the corresponding store methods (e.g., `store.create(...)`, `store.delete(...)`).
- Remove direct service imports from components.
- Components will only import stores.

## Capabilities

### New Capabilities

- `store-encapsulation`: Service logic moved into store factories.

## Impact

- Frontend: Refactor all components to call store methods instead of services.
- Simplification: Decouples UI logic from API service interaction.
