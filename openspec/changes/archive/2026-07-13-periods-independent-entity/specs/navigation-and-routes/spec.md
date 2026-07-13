## ADDED Requirements

### Requirement: Independent Period Navigation

The system SHALL expose periods in navigation without requiring a subject-scoped route as the only entry point.

#### Scenario: Navigate to periods from the sidebar

- **WHEN** a user opens the application sidebar
- **THEN** the system MUST provide a direct entry point to periods management
- **AND** that entry point MUST not depend exclusively on the current subject context

#### Scenario: Access period details from a general context

- **WHEN** a user opens a period from the general periods view
- **THEN** the system MUST be able to show the period context and its related commissions and assignments
- **AND** the system MUST support subject-specific filtering through the `subject_periods` relationship

### Requirement: Preserve Subject-Scoped Flows

The system SHALL preserve existing subject-scoped period workflows where they still make sense.

#### Scenario: Subject-specific period list

- **WHEN** a user enters the periods section from a subject page
- **THEN** the system MUST still be able to show periods relevant to that subject
- **AND** that view MUST be backed by the new `subject_periods` relationship layer
