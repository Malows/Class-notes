# academic-hierarchy Specification

## Purpose

Define and maintain the academic structure of the system, including faculties, subjects, periods, commissions, and students, ensuring data integrity and hierarchical organization.

## Requirements

### Requirement: Faculty Management

The system SHALL allow the user to create, list, and edit multiple Faculties.

#### Scenario: Create a Faculty

- **WHEN** the user provides a name for a new faculty
- **THEN** the system stores the faculty and it appears in the list of available faculties

### Requirement: Subject Management

The system SHALL allow the user to manage Subjects associated with a specific Faculty, maintaining this association in the navigation structure.

#### Scenario: Add Subject to Faculty

- **WHEN** the user selects a faculty and creates a subject with a name
- **THEN** the subject is saved and linked to that faculty
- **AND** the navigation SHALL reflect this nesting (e.g., `/faculties/[f_id]/subjects/[s_id]`)

### Requirement: Period and Commission Management

The system SHALL support organizing subjects into academic periods (Year + Semester 1 or 2) and multiple Commissions per period, maintaining hierarchical paths.

#### Scenario: Create a Commission for a Semester

- **WHEN** the user selects a Subject, a Year (e.g., 2026), and a Semester (1st or 2nd), and creates a Commission (e.g., "A")
- **THEN** the system creates the commission as a container for students and assignments for that specific timeframe
- **AND** the navigation SHALL reflect this nesting (e.g., `.../periods/[p_id]/commissions/[c_id]`)

### Requirement: Student Management

The system SHALL allow the user to manage a list of Students for each Commission.

#### Scenario: Add Student to Commission

- **WHEN** the user adds a student (Name/ID) to a specific commission
- **THEN** the student appears in the roster for that commission
