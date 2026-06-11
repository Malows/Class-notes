## ADDED Requirements

### Requirement: Name-based breadcrumbs

The system SHALL display a breadcrumb trail at the top of the application showing the hierarchical path to the current resource using names instead of IDs.

#### Scenario: Display full breadcrumb path

- **WHEN** user is at `/faculties/1/subjects/2/periods/3/commissions/4/overview`
- **THEN** breadcrumb SHALL show `Home / [Faculty Name] / [Subject Name] / [Period Year-Sem] / [Commission Name] / Overview`

### Requirement: Breadcrumb navigation

Each element in the breadcrumb SHALL be a clickable link to its respective view.

#### Scenario: Navigate back via breadcrumb

- **WHEN** user clicks on the `[Subject Name]` part of the breadcrumb
- **THEN** system SHALL navigate to the Subject detail view.
