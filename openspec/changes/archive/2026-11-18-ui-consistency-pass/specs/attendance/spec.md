# Spec Delta

## ADDED Requirements

### Requirement: Grid readability

The attendance grid SHALL label each column with an assignment reference that stays inside the header and SHALL expose the assignment's full title when that reference is abbreviated.

#### Scenario: Abbreviated header keeps the full title available

- **WHEN** a column label is abbreviated to fit the column
- **THEN** the assignment's full title is available to the user from that header

#### Scenario: Headers do not overlap the grid

- **WHEN** the grid renders, on any viewport
- **THEN** column headers stay within the header row
- **AND** they do not overlap the first row of data

#### Scenario: Row striping starts on the first data row

- **WHEN** the grid alternates row backgrounds
- **THEN** the alternation starts on the first data row
- **AND** the header row is not counted as a data row
