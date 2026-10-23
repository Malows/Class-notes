# assignment-management Specification

## Purpose

TBD - created by archiving change class-notes-init. Update Purpose after archive.

## Requirements

### Requirement: Assignment Definition

The system SHALL allow the user to define practical assignments (TPs) for a Subject in a specific Period, attached to that cursada rather than to the period alone. Creating a TP SHALL affect only the enrollments of that Subject in that Period.

#### Scenario: Create a TP Template

- **WHEN** the user creates a TP with a title for a Subject in Year X, Semester Y
- **THEN** that TP becomes available for all Commissions of that Subject in that Period

#### Scenario: TP does not leak to other subjects sharing the period

- **WHEN** another Subject is linked to the same Period and a TP is created for the first Subject
- **THEN** the students of the other Subject SHALL NOT receive a record for that TP

### Requirement: Copying Assignments from Previous Periods

The system SHALL allow the user to copy the list of assignments from a previous cursada of the same Subject (same Subject, an earlier Year/Semester).

#### Scenario: Reuse TPs from last year

- **WHEN** the user selects "Copy TPs from" and picks a previous Year/Semester of the same Subject
- **THEN** the system duplicates the assignment definitions into the current cursada
- **AND** SHALL NOT create records for students of other Subjects sharing either period
