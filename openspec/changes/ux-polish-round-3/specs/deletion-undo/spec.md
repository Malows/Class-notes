# Spec Delta

## Purpose

Make confirmed deletions reversible for a short window, without exposing deleted records or adding a restore service.

## ADDED Requirements

### Requirement: Deferred deletion

After the user confirms a deletion, the product SHALL remove the record from the current view immediately but SHALL delay the server deletion for a short undo window.

#### Scenario: Confirmed deletion removes the row

- **WHEN** the user confirms deleting an entity
- **THEN** the entity disappears from the current list or detail view
- **AND** a message offers to undo the deletion during the window

#### Scenario: Nothing is deleted before the window ends

- **WHEN** the undo window is still open
- **THEN** the record still exists on the server
- **AND** reloading the view before the window ends brings the record back

### Requirement: Undo a pending deletion

The undo action SHALL cancel the pending deletion and restore the record in the view without a server restore call.

#### Scenario: Undo restores the row

- **WHEN** the user activates undo within the window
- **THEN** the pending deletion is cancelled and no delete request is sent
- **AND** the record reappears in its previous position with its data intact

#### Scenario: Undo after navigating away

- **WHEN** the user leaves the view before the window ends
- **THEN** the pending deletion is committed rather than silently dropped
- **AND** the undo action is no longer offered

### Requirement: Deletion failure is recoverable

If the delayed deletion fails on the server, the product SHALL restore the record in the view and show an error that explains the failure.

#### Scenario: Failed commit

- **WHEN** the delete request fails after the undo window
- **THEN** the record reappears in the view
- **AND** an error message offers a retry
- **AND** the failure is not presented as a successful deletion

### Requirement: Confirmed destructive intent

The undo window SHALL NOT replace the existing confirmation step: a destructive action is confirmed before it is scheduled, and the confirmation names the entity and its consequences.

#### Scenario: Confirmation still runs first

- **WHEN** the user activates a delete action
- **THEN** the confirmation dialog appears before anything is removed
- **AND** dismissing it leaves the record untouched
