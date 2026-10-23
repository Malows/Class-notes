# Spec Delta

## ADDED Requirements

### Requirement: Registry Browsing

The system SHALL provide a browsable list of the active persons in the registry, ordered by name, showing each person's legajo and their number of active enrollments. The list SHALL be paginated and SHALL support filtering by a name or legajo fragment.

#### Scenario: List the registry without a search

- **WHEN** the user opens the registry list without typing a query
- **THEN** the system lists the active persons ordered by name
- **AND** each row shows the person's name, legajo when present, and how many active enrollments they have

#### Scenario: Filter the registry

- **WHEN** the user types a name or legajo fragment
- **THEN** the list shows only persons whose name or legajo contains that fragment
- **AND** a query that matches nobody shows an empty state rather than an error

#### Scenario: Persons with no enrollment stay visible

- **WHEN** an active person has no active enrollment
- **THEN** the person SHALL appear in the list with a count of zero
- **AND** SHALL NOT be hidden by default

#### Scenario: Deleted persons are not listed

- **WHEN** a person is deleted
- **THEN** the person SHALL NOT appear in the registry list

#### Scenario: List pagination

- **WHEN** the registry holds more persons than one page
- **THEN** the system returns one page at a time, with a default page size, and the user can request the next page

### Requirement: Person Cursada History

The system SHALL provide a read-only view of a single person showing their name, legajo and every active enrollment as a cursada, including the subject, the period and the commission the enrollment is assigned to.

#### Scenario: View a person's cursadas

- **WHEN** the user opens the detail of a person
- **THEN** the system shows the person's name and legajo
- **AND** lists each active enrollment with its subject, period and commission

#### Scenario: Enrollment without commission is shown as such

- **WHEN** one of the person's enrollments has no commission assigned
- **THEN** the detail view shows that cursada with an explicit "sin comisión" state
- **AND** SHALL NOT omit the cursada

#### Scenario: Unknown person

- **WHEN** the user opens the detail of an id that does not exist or was deleted
- **THEN** the view shows a not-found state instead of failing

#### Scenario: The views are read-only

- **WHEN** the user browses the registry or a person's detail
- **THEN** no action in those views creates, edits or deletes a person or an enrollment
- **AND** editing a person SHALL remain available only from the enrollment flow of a commission
