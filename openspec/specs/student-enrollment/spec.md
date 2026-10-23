# student-enrollment Specification

## Purpose

Maintain a registry of persons independent of any subject, period, or commission, and record which subject each person is taking in each period (a cursada) and which commission they attend.

## Requirements

### Requirement: Person Registry

The system SHALL maintain a registry of persons (alumnos) independent of any subject, period, or commission. Each person SHALL have a name and an optional legajo, and a legajo SHALL be unique among persons that are not deleted.

#### Scenario: Register a person once

- **WHEN** the user registers a person with a name and a legajo
- **THEN** the system stores a single person record
- **AND** that person SHALL be selectable when enrolling them in any cursada, in any period

#### Scenario: Legajo is optional

- **WHEN** two persons are registered without a legajo
- **THEN** both are stored and neither registration is rejected

#### Scenario: Duplicate legajo is rejected

- **WHEN** the user registers a person whose legajo already belongs to a person that is not deleted
- **THEN** the system rejects the registration with an error naming the existing person
- **AND** SHALL NOT create a second person

#### Scenario: Legajo is reusable after deletion

- **WHEN** a person is deleted and a new person is registered with that same legajo
- **THEN** the registration succeeds

### Requirement: Enrollment in a Cursada

The system SHALL record that a person takes a subject in a specific period as an enrollment. A person SHALL have at most one enrollment that is not deleted per cursada.

#### Scenario: Enroll a person in a cursada

- **WHEN** the user enrolls a person in a subject for a period
- **THEN** the system creates one enrollment linking that person to that subject and period

#### Scenario: Duplicate enrollment is rejected

- **WHEN** the user enrolls a person in a cursada where they already have an enrollment that is not deleted
- **THEN** the system SHALL NOT create a second enrollment

#### Scenario: Re-enroll after removal

- **WHEN** a person's enrollment in a cursada was removed and the person is enrolled in that cursada again
- **THEN** the system creates a new enrollment that is not deleted

### Requirement: Commission Assignment

An enrollment MAY be assigned to at most one commission, which MUST belong to the same subject and period as its cursada. An enrollment MAY remain unassigned.

#### Scenario: Assign an enrollment to a commission

- **WHEN** the user assigns an enrollment to a commission of its cursada
- **THEN** the enrollment appears in that commission's roster

#### Scenario: Unassigned enrollments are pending

- **WHEN** an enrollment has no commission assigned
- **THEN** the system shows it in a pending list for its cursada
- **AND** it SHALL NOT appear in any commission roster

#### Scenario: Commission from another cursada is rejected

- **WHEN** the user assigns an enrollment to a commission of a different subject or a different period
- **THEN** the system rejects the assignment with an error

### Requirement: Commission Roster

The roster of a Commission SHALL consist of the active enrollments assigned to it, ordered by person name, and SHALL be the only source of students for that commission.

#### Scenario: Roster reflects current assignments

- **WHEN** the user opens the students view of a commission
- **THEN** the system lists every enrollment assigned to that commission that is not deleted
- **AND** SHALL NOT list enrollments of other commissions, even for the same person

#### Scenario: Removing an enrollment removes it from the roster

- **WHEN** an enrollment assigned to a commission is removed or unassigned
- **THEN** it no longer appears in that commission's roster

### Requirement: Search-Then-Create Registration

When registering persons into a cursada, the system SHALL match each entry against existing persons — by legajo when provided, otherwise by exact name within the same cursada — SHALL create persons only for entries with no match, and SHALL report how many enrollments were created and how many reused an existing person.

#### Scenario: Paste a list that partially overlaps the registry

- **WHEN** the user pastes a list of names into a commission and some already exist in the registry
- **THEN** the system enrolls the existing persons instead of duplicating them
- **AND** creates persons only for the names with no match
- **AND** reports how many enrollments were created and how many reused an existing person

#### Scenario: Legajo match wins over name

- **WHEN** an entry provides a legajo that matches an existing person whose name differs
- **THEN** the system enrolls the matched person
- **AND** SHALL NOT create a new person

#### Scenario: Ambiguous name without legajo

- **WHEN** an entry provides no legajo and no person with that exact name is enrolled in the same cursada
- **THEN** the system creates a new person rather than guessing among persons with similar names

### Requirement: Enrollment Removal Preserves Person

Removing a student from a cursada SHALL delete only the enrollment. The person SHALL remain in the registry with their legajo and MAY be enrolled in other cursadas.

#### Scenario: Delete a student from a commission

- **WHEN** the user deletes a student from a commission
- **THEN** the system removes that enrollment
- **AND** the person SHALL still exist in the registry

#### Scenario: Person without enrollments is not in any roster

- **WHEN** a person has no enrollment that is not deleted
- **THEN** the person SHALL NOT appear in any commission roster or cursada list
- **AND** SHALL remain resolvable in the person registry

### Requirement: Seeded Enrollment Data

Seed data SHALL create one person and one enrollment for each seeded student, preserving names and legajos, so a freshly initialized database exposes the same commission rosters as before the split.

#### Scenario: Fresh database keeps the rosters

- **WHEN** the database is initialized from migrations and seed data
- **THEN** each seeded student produces exactly one person and one enrollment assigned to the commission that student belonged to
- **AND** every commission roster contains the same names and legajos as the previous schema

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

### Requirement: Person Cursadas

The system SHALL provide a view of a single person showing their name, legajo and every active enrollment as a cursada, including the subject, the period and the commission the enrollment is assigned to.

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

### Requirement: Person Management from the Registry

The system SHALL allow the user to create, edit and delete persons from the registry, independently of any cursada. Editing a person SHALL apply to every cursada of that person, and deleting a person SHALL be a soft delete.

#### Scenario: Create a person from the registry

- **WHEN** the user creates a person with a name and an optional legajo from the registry
- **THEN** the person appears in the registry with zero cursadas
- **AND** SHALL NOT be enrolled in any cursada by that action

#### Scenario: Edit a person from the registry

- **WHEN** the user edits the name or the legajo of a person
- **THEN** the change is stored once on the person
- **AND** every view that shows that person, including every roster of their cursadas, shows the new value

#### Scenario: Reject a legajo already in use

- **WHEN** the user creates or edits a person with a legajo that belongs to another person that is not deleted
- **THEN** the system rejects the change with an error naming the conflict
- **AND** SHALL NOT create a second person nor modify the existing one

#### Scenario: Delete a person

- **WHEN** the user deletes a person and confirms the action
- **THEN** the person is softly deleted and stops appearing in the registry and in every commission roster
- **AND** their active enrollments are softly deleted in the same operation
- **AND** the record SHALL remain in the database, and the legajo SHALL become available again

#### Scenario: Person editing lives only in the registry

- **WHEN** the user views a commission roster
- **THEN** no action in that view creates or edits a person
- **AND** removing a student from the roster removes only the enrollment, never the person
- **AND** the roster SHALL offer a way to reach the person's registry detail
