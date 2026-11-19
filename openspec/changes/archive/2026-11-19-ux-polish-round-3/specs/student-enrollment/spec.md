# Spec Delta

## ADDED Requirements

### Requirement: Registry on narrow viewports

On narrow viewports the person registry SHALL keep each person readable in a compact row and SHALL keep the search reachable while the list scrolls.

#### Scenario: Compact rows

- **WHEN** the registry renders on a phone
- **THEN** each person shows their name, legajo when present and last cursada in a compact card
- **AND** the card's interactive controls keep touch-sized targets

#### Scenario: Search stays reachable

- **WHEN** the user scrolls a long registry list on a phone
- **THEN** the search field remains reachable without returning to the top
- **AND** filtering replaces the list from its first page

#### Scenario: Small pages on a phone

- **WHEN** the registry holds more persons than fit comfortably on a phone
- **THEN** the first page contains at most twenty persons
- **AND** the user can load the next page without losing the current scroll position

#### Scenario: Desktop list unchanged

- **WHEN** the registry renders on a wide viewport
- **THEN** it keeps the tabular presentation and its larger page size
- **AND** the phone density does not reduce desktop columns
