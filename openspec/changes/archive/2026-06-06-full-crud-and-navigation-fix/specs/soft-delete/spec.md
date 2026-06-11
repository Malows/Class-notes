## ADDED Requirements

### Requirement: Soft-delete implementation

The system SHALL support soft-deletion of records by setting a `deletedAt` timestamp.

#### Scenario: Soft-delete a record

- **WHEN** user deletes a record (e.g., a Faculty)
- **THEN** system SHALL set `deletedAt` to current time
- **AND** record SHALL NOT appear in standard lists

### Requirement: Audit timestamps

All records SHALL track their creation and last update times.

#### Scenario: Automated timestamping

- **WHEN** a record is created
- **THEN** system SHALL set `createdAt` and `updatedAt`
- **WHEN** a record is updated
- **THEN** system SHALL refresh `updatedAt`
