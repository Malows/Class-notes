## MODIFIED Requirements

### Requirement: Faculty Management

The system SHALL allow the user to create, list, and edit multiple Faculties using modal-based forms instead of inline cards.

#### Scenario: Create a Faculty

- **WHEN** the user clicks the "Add Faculty" button in the header
- **THEN** a creation modal appears
- **AND WHEN** the user provides a name and saves
- **THEN** the system stores the faculty and it appears in the list

#### Scenario: Edit a Faculty

- **WHEN** the user clicks "Edit" on a faculty row
- **THEN** a modal appears with the current name pre-filled
- **AND WHEN** the user saves the changes
- **THEN** the system updates the faculty name

#### Scenario: Delete a Faculty

- **WHEN** the user clicks "Delete" on a faculty row
- **THEN** a themed confirmation dialog appears
- **AND WHEN** the user confirms
- **THEN** the faculty is removed from the list
