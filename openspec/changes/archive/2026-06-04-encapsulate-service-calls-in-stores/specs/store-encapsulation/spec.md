## ADDED Requirements

### Requirement: Encapsulated Service Interaction

UI components MUST NOT interact directly with API services.

#### Scenario: Component Requests Creation

- **WHEN** component calls `store.create(data)`
- **THEN** store executes service call and updates local state upon success
