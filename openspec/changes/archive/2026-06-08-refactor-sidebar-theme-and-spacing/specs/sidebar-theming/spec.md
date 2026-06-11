## ADDED Requirements

### Requirement: Sidebar theme adaptation

The sidebar SHALL adapt its appearance automatically based on the application's active theme (light or dark), ensuring text visibility and appropriate contrast against the background.

#### Scenario: Sidebar theme in light mode

- **WHEN** application is in light mode
- **THEN** sidebar background color SHALL be a light color (consistent with light theme body) and text color SHALL be dark

#### Scenario: Sidebar theme in dark mode

- **WHEN** application is in dark mode
- **THEN** sidebar background color SHALL be a dark color (consistent with dark theme body) and text color SHALL be light

### Requirement: Sidebar visual separation

The sidebar SHALL be visually separated from the main content area to improve interface readability.

#### Scenario: Sidebar visual separation

- **WHEN** user views the sidebar on a desktop
- **THEN** sidebar SHALL have margins and border-radius, resembling a card element
