## ADDED Requirements

### Requirement: Theme Selection

The system MUST allow users to select between 'Light', 'Dark', and 'Auto' (system preference) themes.

#### Scenario: User changes theme

- **WHEN** user selects a theme
- **THEN** application immediately updates UI colors
- **AND** preference is persisted

### Requirement: Theme Persistence

The system MUST remember the user's theme preference across sessions.

#### Scenario: App reload with stored theme

- **WHEN** user reloads the application
- **THEN** application loads with the previously selected theme
