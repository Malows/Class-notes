# Spec Delta

## ADDED Requirements

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
