## MODIFIED Requirements

### Requirement: Assignment tracking

The system SHALL allow defining, updating, and deleting assignments for a period.

#### Scenario: Update assignment title

- **WHEN** user changes the title of an assignment
- **THEN** system SHALL persist the change and update the UI.

#### Scenario: Delete assignment

- **WHEN** user deletes an assignment
- **THEN** system SHALL mark it as deleted and cascade the deletion status to associated deliveries.
