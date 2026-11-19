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
