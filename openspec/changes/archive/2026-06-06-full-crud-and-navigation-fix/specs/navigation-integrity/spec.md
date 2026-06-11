## ADDED Requirements

### Requirement: Broken path resolution

The system SHALL ensure all navigation paths defined in the hierarchy are reachable.

#### Scenario: Navigate from Subject to Periods

- **WHEN** user is in the Subject list
- **AND** clicks on "Ver periodos" for a specific subject
- **THEN** system SHALL navigate to `/subjects/{id}/periods`

### Requirement: Global Navigation Consistency

The system SHALL provide a consistent navigation structure that avoids dead ends.

#### Scenario: Return to parent context

- **WHEN** user is in a deep section (e.g., Commissions)
- **THEN** system SHALL provide a clear path or link back to the parent Subject or Periods view.
