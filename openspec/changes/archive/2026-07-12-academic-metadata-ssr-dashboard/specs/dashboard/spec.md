## MODIFIED Requirements

### Requirement: Actionable dashboard
The system SHALL function as a dashboard providing high-level summary information and quick actions while also surfacing the active academic context when metadata is available.

#### Scenario: Display metadata context in the dashboard shell
- **WHEN** the dashboard shell loads with SSR metadata available
- **THEN** the system SHALL show an academic context section that highlights the active period and associated subjects.

#### Scenario: Display empty state when no metadata exists
- **WHEN** no active academic metadata is available
- **THEN** the system SHALL render the dashboard shell without breaking and show a graceful empty state for the metadata section.
