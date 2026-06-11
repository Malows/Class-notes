## ADDED Requirements

### Requirement: Dependency Guarding

The UI MUST prevent users from entering views that depend on missing prerequisites by providing guidance.

#### Scenario: Missing Prerequisite

- **WHEN** a user visits a page that depends on another resource (e.g., Subjects page depends on Faculties)
- **AND** the prerequisite resource is empty
- **THEN** the page displays a message explaining the missing dependency
- **AND** a button links the user to the prerequisite creation page
