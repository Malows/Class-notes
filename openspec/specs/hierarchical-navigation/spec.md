# hierarchical-navigation Specification

## Purpose

Standardize the application routing and navigation elements to reflect the logical data hierarchy, improving usability and ensuring consistent context throughout the user experience.

## Requirements

### Requirement: Nested routing

The application routes SHALL reflect the data hierarchy to maintain parent context in the URL. The faculty and subject URL segments SHALL be human-readable slugs resolved to internal ids, and the period and commission segments SHALL NOT use numeric ids: the global and nested period routes SHALL use the semantic `{year}/{semester}` combination, and commission segments SHALL use slugs derived from the commission name.

#### Scenario: Deep link availability

- **WHEN** user shares a link to a commission overview
- **THEN** the URL SHALL identify the Faculty and Subject by slug, the Period by year and semester, and the Commission by its slug, allowing reconstruction of the full context.

#### Scenario: Faculty and subject slugs in the URL

- **WHEN** a user navigates to a subject's periods
- **THEN** the URL SHALL be `/faculties/{facultySlug}/subjects/{subjectSlug}/periods`
- **AND** the system SHALL resolve each slug to its entity id internally

#### Scenario: Nested period URL uses year and semester

- **WHEN** a user navigates to a period of a subject (overview, assignments or commissions)
- **THEN** the URL SHALL be `/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{year}/{semester}/...`
- **AND** the system SHALL resolve the `(year, semester)` combination to the period id within that subject's scope internally

#### Scenario: Commission slug in the URL

- **WHEN** a user opens a commission overview
- **THEN** the URL SHALL be `/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{year}/{semester}/commissions/{commissionSlug}/overview`
- **AND** the system SHALL resolve the slug to the commission id within the subject and period scope internally

#### Scenario: Semantic period URL

- **WHEN** a user navigates to the subjects of the 2026 second-semester period
- **THEN** the URL SHALL be `/periods/2026/2/subjects`
- **AND** the system SHALL resolve the combination `(year=2026, semester=2)` to the corresponding period id and load that period's subjects

#### Scenario: Invalid period URL

- **WHEN** a user opens a global `/periods/{year}/{semester}` for a combination that does not exist
- **THEN** the system SHALL show an empty/not-found state instead of a server error

#### Scenario: Unknown slug

- **WHEN** a user opens a faculty, subject, or commission URL whose slug does not exist
- **THEN** the system SHALL show a not-found state instead of a server error

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

### Requirement: Co-located cursada actions

The system SHALL expose the views of a cursada — summary, commissions, practical assignments, associated subjects and attendance — from the same place for that cursada, so every cursada view is discoverable next to the others.

#### Scenario: Cursada views are reached from one place

- **WHEN** the user is on the list of periods for a subject
- **THEN** that cursada's views are reachable from the cursada's own row
- **AND** the attendance view is reachable from there like the rest

#### Scenario: A cursada view does not live on an unrelated list

- **WHEN** a screen lists the commissions of a cursada
- **THEN** it does not carry the entry point to the cursada's attendance
- **AND** the entry point is available where the other cursada views are

### Requirement: Desktop application shell

On wide viewports the application SHALL use a persistent sidebar and a persistent top header, with the main content offset below the header and beside the sidebar and constrained to the editorial maximum width.

#### Scenario: Sidebar and header stay available

- **WHEN** the user scrolls a long list on a wide viewport
- **THEN** the sidebar and the top header remain visible
- **AND** the main content keeps its offset from both

#### Scenario: Content uses the available width

- **WHEN** the viewport is wider than the editorial maximum
- **THEN** the main content is capped at that maximum
- **AND** it does not stretch list actions to the far edge of the screen

### Requirement: Mobile application shell

On narrow viewports the application SHALL use a fixed top header and a fixed bottom navigation with the primary destinations. It SHALL NOT require an off-canvas drawer to reach the primary destinations.

#### Scenario: Primary destinations are always reachable

- **WHEN** the user is on any page at 390 px wide
- **THEN** the bottom navigation is visible
- **AND** it exposes the primary destinations (dashboard, faculties, periods, students)
- **AND** the page content is padded so the navigation does not cover it

#### Scenario: Context remains visible

- **WHEN** the user is deep in the academic hierarchy on a narrow viewport
- **THEN** the top header keeps the current context visible
- **AND** the bottom navigation still switches to the primary destinations

### Requirement: Current destination indication

The application SHALL mark the active destination in the sidebar and in the mobile bottom navigation, both visually and for assistive technology.

#### Scenario: Active navigation item is announced

- **WHEN** the user is on a page that belongs to a navigation destination
- **THEN** that destination is visually distinguished
- **AND** it exposes the current-page state to assistive technology
