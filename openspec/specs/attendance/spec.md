# attendance Specification

## Purpose

Record whether each student attended each practical assignment, across the commissions of a subject in a period, and present that record as a grid a teacher can read at a glance and fill by swiping.

## Requirements

### Requirement: Attendance Record per Assignment

The system SHALL store at most one attendance record per enrollment and practical assignment, with a status of `PRESENT` or `ABSENT`, the date the value was recorded, and the commission where it was taken. An enrollment with no record for an assignment SHALL be treated as not taken yet, never as absent.

#### Scenario: Mark a student present

- **WHEN** the user marks a student present for an assignment
- **THEN** an attendance record is stored with status present and today's date
- **AND** the commission where it was taken is recorded with it

#### Scenario: Mark a student absent

- **WHEN** the user marks a student absent for an assignment
- **THEN** an attendance record is stored with status absent
- **AND** the record SHALL be distinguishable from "not taken yet"

#### Scenario: Unmark a student

- **WHEN** the user clears a previously recorded attendance
- **THEN** the record is removed and the cell returns to the not-taken state

#### Scenario: Recording the same assignment again overwrites the value

- **WHEN** attendance is recorded for an enrollment and assignment that already has a record
- **THEN** the existing record is updated instead of duplicated
- **AND** its recorded date is replaced with the new one

#### Scenario: Reject a student from another cursada

- **WHEN** the user tries to record attendance for a student who is not enrolled in the cursada of the assignment
- **THEN** the system rejects the record with an error
- **AND** SHALL NOT store any attendance

### Requirement: Attendance Grid

The system SHALL present attendance as a grid with enrollments as rows and the cursada's assignments as columns, and SHALL allow reading it scoped to one commission or to the whole cursada.

#### Scenario: Read the grid of a commission

- **WHEN** the user opens the attendance of a commission
- **THEN** the rows are the enrollments of that commission that are not deleted, ordered by person name
- **AND** the columns are the assignments of the cursada
- **AND** each cell shows present, absent or not taken

#### Scenario: Read the grid of a cursada

- **WHEN** the user opens the attendance of a subject in a period
- **THEN** the rows are every enrollment of that cursada, including those without a commission
- **AND** each row identifies the commission it belongs to

#### Scenario: Deleted enrollments are not shown

- **WHEN** an enrollment or its person is deleted
- **THEN** it SHALL NOT appear as a row in any attendance grid

### Requirement: Sequential Take Mode

The system SHALL provide a take mode that walks the students of one commission for a chosen assignment, one at a time, and lets the user decide with a gesture or a keyboard key.

#### Scenario: Decide with a swipe

- **WHEN** the user swipes right on the current student
- **THEN** that student is marked present and the next student is shown
- **AND WHEN** the user swipes left
- **THEN** that student is marked absent and the next student is shown
- **AND WHEN** the user swipes up
- **THEN** the student is skipped without recording anything and the next student is shown

#### Scenario: Decide with the keyboard

- **WHEN** the user presses the right, left or up arrow key
- **THEN** the decision matches the corresponding swipe
- **AND** every decision SHALL also be reachable through visible buttons

#### Scenario: Undo the last decision

- **WHEN** the user undoes the last decision
- **THEN** the previously recorded value for that student is restored
- **AND** the take mode returns to that student

#### Scenario: Finish the run

- **WHEN** the user decides on the last student
- **THEN** the system reports how many were marked present, absent and skipped
- **AND** skipped students remain unmarked

### Requirement: Bulk Attendance

The system SHALL allow marking every student of an assignment present in one action, before or during take mode.

#### Scenario: Mark every student present

- **WHEN** the user marks all students present for an assignment
- **THEN** every student in scope receives a present record for that assignment
- **AND** the user can then change individual students

### Requirement: Attendance Summary

The system SHALL summarise attendance per student and per assignment. The summary SHALL count only assignments with a record; an assignment that was not taken SHALL NOT count as an absence.

#### Scenario: Per-student summary

- **WHEN** the user reads an attendance grid
- **THEN** each row shows how many assignments the student attended and how many have been taken for that student

#### Scenario: Per-assignment count

- **WHEN** the user reads an attendance grid
- **THEN** each column shows how many students are present for that assignment
- **AND** assignments with no records show an empty state instead of zero present
