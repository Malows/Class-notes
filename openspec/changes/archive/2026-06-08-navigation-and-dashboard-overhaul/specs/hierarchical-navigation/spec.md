## ADDED Requirements

### Requirement: Nested routing

The application routes SHALL reflect the data hierarchy to maintain parent context in the URL.

#### Scenario: Deep link availability

- **WHEN** user shares a link to a commission overview
- **THEN** the URL SHALL contain IDs for Faculty, Subject, and Period to allow reconstruction of the full context.

### Requirement: Context-aware sidebar

The system SHALL provide a sidebar that shows sibling resources for the current context.

#### Scenario: Switching between commissions

- **WHEN** user is viewing a commission
- **THEN** sidebar SHALL show other commissions belonging to the same Period for quick switching.
