## ADDED Requirements

### Requirement: Academic metadata context endpoint
The system SHALL expose a metadata endpoint that returns the active academic context for the current server time, including the current period and the set of associated subjects.

#### Scenario: Return active metadata for the current period
- **WHEN** a client requests `/api/v1/metadata`
- **THEN** the system SHALL return the active period metadata and the associated subject list for that period.

#### Scenario: Return empty metadata when no period matches
- **WHEN** no active period matches the server date rules
- **THEN** the system SHALL return an empty metadata state that allows the sidebar to render its fallback navigation.

### Requirement: Active period calculation
The system SHALL determine the active period by matching the server current year and semester with the period's year and term using the rule YEAR(now) = YEAR(period) and MONTH(now) <= SEMESTER(period).

#### Scenario: Select the current semester period
- **WHEN** the server date falls within the configured semester window for a period
- **THEN** the system SHALL mark that period as active for metadata retrieval.

#### Scenario: Exclude periods outside the current year or semester window
- **WHEN** a period belongs to another year or a later semester window than the server date
- **THEN** the system SHALL exclude that period from the active metadata payload.
