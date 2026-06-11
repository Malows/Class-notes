## MODIFIED Requirements

### Requirement: Faculty management

The system SHALL allow creating, reading, updating and deleting faculties.

#### Scenario: Update faculty name

- **WHEN** user submits a valid name change for a faculty
- **THEN** system SHALL update the faculty name and refresh the view.

#### Scenario: Delete faculty

- **WHEN** user deletes a faculty
- **THEN** system SHALL mark it as deleted and it SHALL NOT appear in lists.

### Requirement: Subject management

The system SHALL allow managing subjects associated with faculties, including update and delete operations.

#### Scenario: Delete subject

- **WHEN** user deletes a subject
- **THEN** system SHALL mark it as deleted and it SHALL NOT appear in lists.

## REMOVED Requirements

### Requirement: Student External ID

**Reason**: Field is unused and adds unnecessary complexity to the model.
**Migration**: Existing data in `external_id` will be dropped.
