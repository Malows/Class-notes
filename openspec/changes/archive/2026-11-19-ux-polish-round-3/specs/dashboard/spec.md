# Spec Delta

## ADDED Requirements

### Requirement: Term selection and scope

The dashboard SHALL present a visible term selector, SHALL scope its modules to the selected term, and SHALL state when it fell back to another term.

#### Scenario: Selecting a term

- **WHEN** the teacher changes the selected term
- **THEN** the commission list, pending corrections and statistics update to that term
- **AND** each module states the term it covers

#### Scenario: Fallback with an explanation

- **WHEN** the active term has no commissions
- **THEN** the dashboard opens the most recent term that has data
- **AND** a note next to the selector explains why another term is shown

#### Scenario: Term with no work

- **WHEN** the selected term has no commissions
- **THEN** the dashboard shows an explicit empty state for that term
- **AND** the selector remains available to change it

### Requirement: Continue the last cursada

The dashboard SHALL offer a shortcut back to the last academic view the teacher opened, provided it still resolves.

#### Scenario: Returning to the last cursada

- **WHEN** the teacher has opened a cursada or commission view and returns to the dashboard
- **THEN** a shortcut names that subject, period and commission and links back to it

#### Scenario: Stale shortcut

- **WHEN** the stored view no longer resolves to an existing cursada or commission
- **THEN** the shortcut is not shown
- **AND** the stored reference is cleared
