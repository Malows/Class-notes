# dashboard Specification

## Purpose

Provide a central entry point for users with relevant academic statistics, pending tasks, and quick access to active resources.

## Requirements

### Requirement: Actionable dashboard

The system home page SHALL function as a dashboard providing high-level summary information and quick actions.

#### Scenario: Display pending corrections

- **WHEN** user views the dashboard
- **THEN** system SHALL show a list of active commissions with counts of uncorrected deliveries.

### Requirement: Statistics summary

The dashboard SHALL display summarized statistics for the current or most recent period.

#### Scenario: View approval rate

- **WHEN** user views the dashboard
- **THEN** system SHALL show the overall approval rate for current active students.

### Requirement: Editorial dashboard layout

The dashboard SHALL use the editorial grid: a twelve-column workspace on wide viewports and a single stacked column on narrow viewports, with the pending and statistics blocks presented as editorial modules.

#### Scenario: Wide dashboard

- **WHEN** the dashboard renders at 1440 px wide
- **THEN** pending corrections and the statistics summary occupy the twelve-column workspace
- **AND** their actions stay within the editorial maximum width

#### Scenario: Narrow dashboard

- **WHEN** the dashboard renders at 390 px wide
- **THEN** the modules stack at full content width
- **AND** the document does not scroll horizontally

#### Scenario: Statistics remain legible

- **WHEN** the statistics module renders at 390 px wide
- **THEN** its values and labels stay readable without one-word-per-line wrapping

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
