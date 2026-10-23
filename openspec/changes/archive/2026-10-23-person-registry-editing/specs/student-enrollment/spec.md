# Spec Delta

## REMOVED Requirements

### Requirement: Person Cursada History

**Reason**: The view is no longer read-only. Person management moved into the registry, so the requirement that forbade editing from those views no longer describes the system.

**Migration**: Replaced by "Person Cursadas" below, which keeps the cursada listing and drops the read-only constraint. Creating, editing and deleting a person is covered by "Person Management from the Registry".

## ADDED Requirements

### Requirement: Person Cursadas

The system SHALL provide a view of a single person showing their name, legajo and every active enrollment as a cursada, including the subject, the period and the commission the enrollment is assigned to.

#### Scenario: View a person's cursadas

- **WHEN** the user opens the detail of a person
- **THEN** the system shows the person's name and legajo
- **AND** lists each active enrollment with its subject, period and commission

#### Scenario: Enrollment without commission is shown as such

- **WHEN** one of the person's enrollments has no commission assigned
- **THEN** the detail view shows that cursada with an explicit "sin comisión" state
- **AND** SHALL NOT omit the cursada

#### Scenario: Unknown person

- **WHEN** the user opens the detail of an id that does not exist or was deleted
- **THEN** the view shows a not-found state instead of failing

### Requirement: Person Management from the Registry

The system SHALL allow the user to create, edit and delete persons from the registry, independently of any cursada. Editing a person SHALL apply to every cursada of that person, and deleting a person SHALL be a soft delete.

#### Scenario: Create a person from the registry

- **WHEN** the user creates a person with a name and an optional legajo from the registry
- **THEN** the person appears in the registry with zero cursadas
- **AND** SHALL NOT be enrolled in any cursada by that action

#### Scenario: Edit a person from the registry

- **WHEN** the user edits the name or the legajo of a person
- **THEN** the change is stored once on the person
- **AND** every view that shows that person, including every roster of their cursadas, shows the new value

#### Scenario: Reject a legajo already in use

- **WHEN** the user creates or edits a person with a legajo that belongs to another person that is not deleted
- **THEN** the system rejects the change with an error naming the conflict
- **AND** SHALL NOT create a second person nor modify the existing one

#### Scenario: Delete a person

- **WHEN** the user deletes a person and confirms the action
- **THEN** the person is softly deleted and stops appearing in the registry and in every commission roster
- **AND** their active enrollments are softly deleted in the same operation
- **AND** the record SHALL remain in the database, and the legajo SHALL become available again

#### Scenario: Person editing lives only in the registry

- **WHEN** the user views a commission roster
- **THEN** no action in that view creates or edits a person
- **AND** removing a student from the roster removes only the enrollment, never the person
- **AND** the roster SHALL offer a way to reach the person's registry detail
