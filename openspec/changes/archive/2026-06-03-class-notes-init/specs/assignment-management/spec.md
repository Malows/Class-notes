## ADDED Requirements

### Requirement: Assignment Definition

The system SHALL allow the user to define practical assignments (TPs) for a Subject in a specific Period.

#### Scenario: Create a TP Template

- **WHEN** the user creates a TP with a title for a Subject in Year X, Semester Y
- **THEN** that TP becomes available for all Commissions of that Subject in that Period

### Requirement: Copying Assignments from Previous Periods

The system SHALL allow the user to copy the list of assignments from a previous Period (Year/Semester) of the same Subject.

#### Scenario: Reuse TPs from last year

- **WHEN** the user selects "Copy TPs from" and picks a previous Year/Semester
- **THEN** the system duplicates the assignment definitions into the current Period
