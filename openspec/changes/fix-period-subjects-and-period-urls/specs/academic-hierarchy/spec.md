# Spec Delta

## MODIFIED Requirements

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