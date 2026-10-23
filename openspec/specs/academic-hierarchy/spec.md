# academic-hierarchy Specification

## Purpose

Define and maintain the academic structure of the system, including faculties, subjects, periods, commissions, and students, ensuring data integrity and hierarchical organization.

## Requirements

### Requirement: Faculty Management

The system SHALL allow the user to create, list, and edit multiple Faculties using modal-based forms instead of inline cards. Each Faculty SHALL have a unique, human-readable slug derived from its name, regenerated whenever the name changes.

#### Scenario: Create a Faculty

- **WHEN** the user clicks the "Add Faculty" button in the header
- **THEN** a creation modal appears
- **AND WHEN** the user provides a name and saves
- **THEN** the system stores the faculty and it appears in the list

#### Scenario: Edit a Faculty

- **WHEN** the user clicks "Edit" on a faculty row
- **THEN** a modal appears with the current name pre-filled
- **AND WHEN** the user saves the changes
- **THEN** the system updates the faculty name

#### Scenario: Delete a Faculty

- **WHEN** the user clicks "Delete" on a faculty row
- **THEN** a themed confirmation dialog appears
- **AND WHEN** the user confirms
- **THEN** the faculty is removed from the list

#### Scenario: Faculty slug is unique and regenerates on edit

- **WHEN** a faculty is created or its name is edited
- **THEN** its slug SHALL be derived from the name and SHALL be unique across all faculties
- **AND** the faculty's own row SHALL be excluded from the uniqueness check
- **AND** when the derived slug is already taken, a numeric suffix SHALL be appended

### Requirement: Subject Management

The system SHALL allow the user to manage Subjects associated with a specific Faculty, maintaining this association in the navigation structure. Each Subject SHALL have a slug derived from its name, regenerated whenever the name changes, and unique within its Faculty.

#### Scenario: Add Subject to Faculty

- **WHEN** the user selects a faculty and creates a subject with a name
- **THEN** the subject is saved and linked to that faculty
- **AND** the navigation SHALL reflect this nesting (e.g., `/faculties/[facultySlug]/subjects/[subjectSlug]`)

#### Scenario: Subject slug is unique within its faculty

- **WHEN** a subject is created or renamed inside a faculty
- **THEN** its slug SHALL be unique among that faculty's subjects
- **AND** the subject's own row SHALL be excluded from the uniqueness check
- **AND** when the derived slug is already taken, a numeric suffix SHALL be appended

### Requirement: Period and Commission Management

The system SHALL support organizing subjects into academic periods (Year + Semester 1 or 2) and multiple Commissions per period, maintaining hierarchical paths. The system SHALL allow the user to view and manage the subjects associated with a period, and period data SHALL be retrievable by id so those views load successfully. Data integrity SHALL be ensured by keeping the database schema in sync with the application code so periods, commissions, persons, enrollments, assignments, and deliveries persist correctly. Each Commission SHALL have a slug derived from its name, unique among commissions of the same Subject and Period, regenerated whenever the name changes.

#### Scenario: Create a Commission for a Semester

- **WHEN** the user selects a Subject, a Year (e.g., 2026), and a Semester (1st or 2nd), and creates a Commission (e.g., "A")
- **THEN** the system creates the commission as a container for enrollments and assignments for that specific timeframe
- **AND** the navigation SHALL reflect this nesting (e.g., `.../periods/[year]/[semester]/commissions/[commissionSlug]`)

#### Scenario: Commission slug is unique within its subject and period

- **WHEN** a commission is created or renamed inside a subject's period
- **THEN** its slug SHALL be derived from the name and unique among commissions of that subject and period
- **AND** the commission's own row SHALL be excluded from the uniqueness check
- **AND** when the derived slug is already taken, a numeric suffix SHALL be appended

#### Scenario: View subjects of a period

- **WHEN** the user opens the subjects view of a period (e.g. from the periods list)
- **THEN** the system SHALL return the period by id and show the subjects currently linked to it

#### Scenario: Navigate to period subjects instead of editing

- **WHEN** the user clicks the "Materias" action for a period row inside a subject's periods table
- **THEN** the system SHALL navigate to the period's subjects view
- **AND** SHALL NOT open the period edit form

#### Scenario: Seeded academic data persists

- **WHEN** the database is initialized fresh (migrations applied and seed data inserted)
- **THEN** commissions, persons, enrollments, assignments, and deliveries SHALL be created and persisted, matching the schema declared by the application

### Requirement: Student Management

The system SHALL allow the user to manage the students of a Subject in a Period through enrollments. Each enrollment SHALL link a person to the cursada and MAY assign that enrollment to one of the cursada's commissions. Deleting a student from a commission SHALL remove the enrollment, never the person.

#### Scenario: Add Student to Commission

- **WHEN** the user adds a student (Name/ID) whose name matches no person in the registry to a specific commission
- **THEN** the system creates the person and an enrollment assigned to that commission
- **AND** the student appears in the roster for that commission

#### Scenario: Add a student that already exists

- **WHEN** the user adds a student who already exists in the registry to a specific commission
- **THEN** the system enrolls the existing person instead of creating a duplicate
- **AND** the student appears in the roster for that commission

#### Scenario: Assign a pending enrollment to a commission

- **WHEN** the user assigns an enrollment of the cursada to a commission
- **THEN** the enrollment moves from the pending list into that commission's roster

#### Scenario: Remove a student from a commission

- **WHEN** the user deletes a student from a commission's roster
- **THEN** the system removes that enrollment
- **AND** the person SHALL remain in the registry

### Requirement: Subject-Period Link Lifecycle

The system SHALL allow a subject to be unlinked from a period and linked to it again later, treating links that are deleted as absent when checking uniqueness.

#### Scenario: Re-link a subject that was unlinked

- **WHEN** the user unlinks a subject from a period and then links that same subject to the same period again
- **THEN** the system restores the link
- **AND** SHALL NOT fail with a uniqueness error
