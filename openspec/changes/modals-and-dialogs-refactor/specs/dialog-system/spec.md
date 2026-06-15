## ADDED Requirements

### Requirement: Base Modal Infrastructure

The system SHALL provide a reusable modal dialog component (`DialogBase`) that supports custom titles, body content, and footer actions through snippets.

#### Scenario: Open a modal

- **WHEN** the user triggers an action associated with a modal
- **THEN** the modal overlay appears on top of the content with a background dimming effect
- **AND** the content is focused within the modal

### Requirement: Styled Deletion Confirmation

The system SHALL provide a themed confirmation dialog for destructive actions, replacing native browser `confirm()` calls.

#### Scenario: Confirm deletion

- **WHEN** the user clicks a delete button
- **THEN** a modal appears asking for confirmation and showing the item name
- **AND** the confirm button uses the `btn-danger` style
