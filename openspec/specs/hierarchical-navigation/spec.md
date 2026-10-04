# hierarchical-navigation Specification

## Purpose

Standardize the application routing and navigation elements to reflect the logical data hierarchy, improving usability and ensuring consistent context throughout the user experience.

## Requirements

### Requirement: Nested routing

The application routes SHALL reflect the data hierarchy to maintain parent context in the URL. Period routes in the global periods area SHALL use the semantic `{year}/{semester}` combination (`/periods/{year}/{semester}`) instead of the internal numeric period id, resolving to the id only internally.

#### Scenario: Deep link availability

- **WHEN** user shares a link to a commission overview
- **THEN** the URL SHALL contain IDs for Faculty, Subject, and Period to allow reconstruction of the full context.

#### Scenario: Semantic period URL

- **WHEN** a user navigates to the subjects of the 2026 second-semester period
- **THEN** the URL SHALL be `/periods/2026/2/subjects`
- **AND** the system SHALL resolve the combination `(year=2026, semester=2)` to the corresponding period id and load that period's subjects

#### Scenario: Invalid period URL

- **WHEN** a user opens `/periods/{year}/{semester}` for a combination that does not exist
- **THEN** the system SHALL show an empty/not-found state instead of a server error

### Requirement: Context-aware sidebar

The system SHALL provide a sidebar that shows sibling resources for the current context. The quick-access sections SHALL render the actual resources for the current context (active-quarter subjects or current faculty subjects, periods, commissions) with working direct links; they SHALL NOT render empty sections or a "no active context" fallback while data exists.

#### Scenario: Switching between commissions

- **WHEN** user is viewing a commission
- **THEN** sidebar SHALL show other commissions belonging to the same Period for quick switching.

#### Scenario: Active quarter subjects in quick access

- **WHEN** there is an active academic quarter (year + semester) with subjects linked to it
- **THEN** the sidebar SHALL list those subjects as quick-access links pointing directly at each subject's periods page

#### Scenario: Sibling lists on deep pages

- **WHEN** user is on a deep page (e.g. period overview, assignments, commissions)
- **THEN** the sidebar SHALL show the real sibling lists (subjects, periods, commissions) for that context
- **AND** each item SHALL be a working link that switches to the sibling resource
