# Spec Delta

## MODIFIED Requirements

### Requirement: Nested routing

The application routes SHALL reflect the data hierarchy to maintain parent context in the URL. The faculty and subject URL segments SHALL be human-readable slugs resolved to internal ids, the global period routes SHALL use the semantic `{year}/{semester}` combination instead of the internal numeric period id, and period/commission segments nested under a subject SHALL keep numeric ids.

#### Scenario: Deep link availability

- **WHEN** user shares a link to a commission overview
- **THEN** the URL SHALL identify the Faculty and Subject by slug and the Period and Commission by their keys, allowing reconstruction of the full context.

#### Scenario: Faculty and subject slugs in the URL

- **WHEN** a user navigates to a subject's periods
- **THEN** the URL SHALL be `/faculties/{facultySlug}/subjects/{subjectSlug}/periods`
- **AND** the system SHALL resolve each slug to its entity id internally

#### Scenario: Semantic period URL

- **WHEN** a user navigates to the subjects of the 2026 second-semester period
- **THEN** the URL SHALL be `/periods/2026/2/subjects`
- **AND** the system SHALL resolve the combination `(year=2026, semester=2)` to the corresponding period id and load that period's subjects

#### Scenario: Invalid period URL

- **WHEN** a user opens `/periods/{year}/{semester}` for a combination that does not exist
- **THEN** the system SHALL show an empty/not-found state instead of a server error

#### Scenario: Unknown slug

- **WHEN** a user opens a faculty or subject URL whose slug does not exist
- **THEN** the system SHALL show a not-found state instead of a server error