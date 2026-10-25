# Spec Delta

## ADDED Requirements

### Requirement: Cursada Roster

The system SHALL return the students enrolled in a subject for a specific period, each with the commission it belongs to, so a cursada can be read without resolving its commissions separately.

#### Scenario: List the students of a cursada

- **WHEN** the user asks for the students of a subject in a period
- **THEN** the system returns every enrollment of that cursada that is not deleted
- **AND** each one carries the person's name, legajo and the commission it belongs to
- **AND** the list SHALL be ordered by person name

#### Scenario: Students without commission are included

- **WHEN** an enrollment of the cursada has no commission assigned
- **THEN** it SHALL appear in the list with an explicit "no commission" state
- **AND** SHALL NOT be omitted

#### Scenario: The cursada carries its subject, period and commissions

- **WHEN** the user asks for the students of a subject in a period
- **THEN** the response identifies the subject and the period it belongs to
- **AND** it lists the commissions of that cursada, so the caller can label or filter without a second read

#### Scenario: Subject not linked to the period

- **WHEN** the subject is not linked to the requested period
- **THEN** the system returns a not-found error instead of an empty list

#### Scenario: Deleted entities are excluded

- **WHEN** an enrollment, a person or a commission of the cursada is deleted
- **THEN** it SHALL NOT appear in the roster
