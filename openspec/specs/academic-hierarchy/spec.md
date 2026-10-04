# academic-hierarchy Specification

## Purpose

Define and maintain the academic structure of the system, including faculties, subjects, periods, commissions, and students, ensuring data integrity and hierarchical organization.

## Requirements

### Requirement: Faculty Management

The system SHALL allow the user to create, list, and edit multiple Faculties using modal-based forms instead of inline cards.

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

### Requirement: Subject Management

The system SHALL allow the user to manage Subjects associated with a specific Faculty, maintaining this association in the navigation structure.

#### Scenario: Add Subject to Faculty

- **WHEN** the user selects a faculty and creates a subject with a name
- **THEN** the subject is saved and linked to that faculty
- **AND** the navigation SHALL reflect this nesting (e.g., `/faculties/[f_id]/subjects/[s_id]`)

### Requirement: Period and Commission Management

The system SHALL support organizing subjects into academic periods (Year + Semester 1 or 2) and multiple Commissions per period, maintaining hierarchical paths. The system SHALL allow the user to view and manage the subjects associated with a period, and period data SHALL be retrievable by id so those views load successfully. Data integrity SHALL be ensured by keeping the database schema in sync with the application code so periods, commissions, students, assignments, and deliveries persist correctly.

#### Scenario: Create a Commission for a Semester

- **WHEN** the user selects a Subject, a Year (e.g., 2026), and a Semester (1st or 2nd), and creates a Commission (e.g., "A")
- **THEN** the system creates the commission as a container for students and assignments for that specific timeframe
- **AND** the navigation SHALL reflect this nesting (e.g., `.../periods/[p_id]/commissions/[c_id]`)

#### Scenario: View subjects of a period

- **WHEN** the user opens the subjects view of a period (e.g. from the periods list)
- **THEN** the system SHALL return the period by id and show the subjects currently linked to it

#### Scenario: Navigate to period subjects instead of editing

- **WHEN** the user clicks the "Materias" action for a period row inside a subject's periods table
- **THEN** the system SHALL navigate to the period's subjects view
- **AND** SHALL NOT open the period edit form

#### Scenario: Seeded academic data persists

- **WHEN** the database is initialized fresh (migrations applied and seed data inserted)
- **THEN** commissions, students, assignments, and deliveries SHALL be created and persisted, matching the schema declared by the application

### Requirement: Student Management

The system SHALL allow the user to manage a list of Students for each Commission.

#### Scenario: Add Student to Commission

- **WHEN** the user adds a student (Name/ID) to a specific commission
- **THEN** the student appears in the roster for that commission
