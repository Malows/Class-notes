## MODIFIED Requirements

### Requirement: Centralized Resource Store

The frontend MUST store API resource data in centralized state classes (using Svelte 5 Runes) to prevent redundant network calls and enable reactive UI updates.

#### Scenario: First Access Triggers Fetch

- **WHEN** a component calls `store.load()` for the first time
- **THEN** the state class initiates a fetch request and updates its reactive properties.

#### Scenario: Subsequent Access Returns Cached

- **WHEN** a component calls `store.load()` on an already-loaded state class
- **THEN** the state class does NOT initiate a fetch request (unless a force refresh is specified).

### Requirement: Reactive UI via Push Mutations

The system MUST update the UI reactively when data is mutated (created, deleted) without full page refetching, leveraging Svelte 5's fine-grained reactivity.

#### Scenario: Successful Resource Creation

- **WHEN** user creates a resource via the state class method
- **THEN** the reactive array is updated in-place and UI updates immediately without manual subscription management.
