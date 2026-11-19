# Spec Delta

## Purpose

Prevent silent loss of unsaved edits when the user navigates away from a dirty form.

## ADDED Requirements

### Requirement: Guard dirty forms on navigation

A form with unsaved changes SHALL intercept client-side navigation away from it and ask what to do before leaving.

#### Scenario: Dirty form blocks a link

- **WHEN** the user follows an in-app link, breadcrumb or back control while the form is dirty
- **THEN** navigation is paused and a dialog offers Save, Discard and Keep editing
- **AND** the URL does not change until the user chooses

#### Scenario: Dirty form blocks browser back

- **WHEN** the user presses the browser Back button while the form is dirty
- **THEN** the same dialog appears instead of leaving silently
- **AND** choosing Keep editing keeps the current page and its values

### Requirement: Save, discard or keep editing

The dialog SHALL offer three outcomes: save the changes and continue, discard the changes and continue, or stay on the form.

#### Scenario: Save then leave

- **WHEN** the user chooses Save
- **THEN** the form is saved first
- **AND** navigation continues only if the save succeeds

#### Scenario: Save fails

- **WHEN** the user chooses Save and the save fails
- **THEN** the form remains on screen with its values and an error
- **AND** navigation does not continue

#### Scenario: Keep editing

- **WHEN** the user chooses Keep editing
- **THEN** the dialog closes, the draft is unchanged, and focus returns to the control that started the navigation

#### Scenario: Discard

- **WHEN** the user chooses Discard
- **THEN** the pending navigation proceeds without saving
- **AND** the form is left with its edits abandoned

### Requirement: Clean forms navigate freely

A form without unsaved changes SHALL NOT show the guard or delay navigation.

#### Scenario: Clean form leaves immediately

- **WHEN** the form matches its last saved values
- **THEN** navigation proceeds without a dialog

### Requirement: Guard page unload

The form SHALL warn before the page is unloaded, reloaded or closed while it has unsaved changes.

#### Scenario: Reload with unsaved changes

- **WHEN** the user reloads or closes the page while the form is dirty
- **THEN** the browser's native leave warning is shown
- **AND** a clean form does not trigger the warning
