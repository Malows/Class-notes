# Spec Delta

## Purpose

Maintain a registry of persons independent of any subject, period, or commission, and record which subject each person is taking in each period (a cursada) and which commission they attend.

## ADDED Requirements

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
