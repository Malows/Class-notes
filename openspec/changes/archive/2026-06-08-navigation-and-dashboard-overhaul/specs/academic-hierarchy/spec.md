## MODIFIED Requirements

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
