## Context

Components should be "dumb" regarding API communication. The store is responsible for fetching, state management, and ensuring the backend service call is made successfully.

## Goals / Non-Goals

**Goals:**

- UI components import ONLY stores.
- Store methods perform service calls (create, update, delete).
- Store methods handle the "push" mutation update.

## Decisions

- **Pattern**: `store.action(...)` = service call + local state update.

## Risks / Trade-offs

- [Trade-off] Slightly larger store files. → Mitigation: Clearer API for components, easier testing of state management logic.
