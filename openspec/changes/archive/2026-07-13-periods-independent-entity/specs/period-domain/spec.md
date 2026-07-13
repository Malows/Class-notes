## ADDED Requirements

### Requirement: Independent Period Entity

The system SHALL model `Period` as an independent entity that is no longer owned directly by a `Subject`.

#### Scenario: Create a period without subject context

- **WHEN** a user creates a new academic period from the general periods workflow
- **THEN** the system MUST persist the period as a standalone record
- **AND** the system MUST allow that period to be linked to one or more subjects through an explicit relationship

#### Scenario: Link a period to a subject

- **WHEN** a period is associated with a subject
- **THEN** the system MUST store that relationship through an explicit `subject_periods` association
- **AND** the system MUST not rely on `period.subject_id` as the association mechanism

#### Scenario: Auto-create the active subject-period association

- **WHEN** the server evaluates the current academic semester for a subject and no matching `subject_periods` association exists
- **THEN** the system MUST create the required `Period` and `subject_periods` association automatically
- **AND** the operation MUST be idempotent for repeated requests

### Requirement: Subject-Period Relationship

The system SHALL use an explicit pivot table between `Subject` and `Period`.

#### Scenario: A subject has multiple periods

- **WHEN** a subject is associated with multiple academic periods
- **THEN** the system MUST be able to list all linked periods for that subject

#### Scenario: A period belongs to multiple subjects

- **WHEN** a period is shared across more than one subject
- **THEN** the system MUST preserve each subject-period association independently
