# Spec Delta

## ADDED Requirements

### Requirement: Current term shortcut

The sidebar SHALL offer a shortcut to the active academic term, clearly separated from the cursada currently being viewed, and SHALL target the global period view for that term.

#### Scenario: Shortcut target

- **WHEN** the teacher activates the current-term shortcut
- **THEN** the application opens the subject list for that year and semester
- **AND** it does not open an arbitrary subject's period index

#### Scenario: Shortcut is separate from context

- **WHEN** the teacher is viewing a cursada from an older term
- **THEN** the current term shortcut is labelled as the active term and visually separated from the "you are viewing" context
- **AND** it is not marked as the current page

#### Scenario: No active term

- **WHEN** no term is marked as active
- **THEN** the shortcut is absent
- **AND** the viewed cursada context remains visible
