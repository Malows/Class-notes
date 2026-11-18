# Spec Delta

## ADDED Requirements

### Requirement: Narrow-viewport dashboard layout

The dashboard SHALL adapt its layout to the viewport width: on narrow viewports its main sections SHALL stack and the page SHALL NOT scroll horizontally; on wide viewports the sections SHALL remain side by side.

#### Scenario: Sections stack on a phone

- **WHEN** the dashboard renders at 390 px wide
- **THEN** the pending corrections section and the statistics section appear one below the other at the full content width
- **AND** the document's scroll width does not exceed the viewport width

#### Scenario: Statistics stay legible on a phone

- **WHEN** the dashboard renders at 390 px wide
- **THEN** the four statistics form a two-column grid inside the full-width statistics card
- **AND** no statistic label wraps one word per line

#### Scenario: Wide viewports keep the two-column arrangement

- **WHEN** the dashboard renders at 1440 px wide
- **THEN** pending corrections and statistics remain side by side with pending corrections taking the larger share
