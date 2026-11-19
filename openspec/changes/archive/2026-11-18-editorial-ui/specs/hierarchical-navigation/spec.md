# Spec Delta

## ADDED Requirements

### Requirement: Desktop application shell

On wide viewports the application SHALL use a persistent sidebar and a persistent top header, with the main content offset below the header and beside the sidebar and constrained to the editorial maximum width.

#### Scenario: Sidebar and header stay available

- **WHEN** the user scrolls a long list on a wide viewport
- **THEN** the sidebar and the top header remain visible
- **AND** the main content keeps its offset from both

#### Scenario: Content uses the available width

- **WHEN** the viewport is wider than the editorial maximum
- **THEN** the main content is capped at that maximum
- **AND** it does not stretch list actions to the far edge of the screen

### Requirement: Mobile application shell

On narrow viewports the application SHALL use a fixed top header and a fixed bottom navigation with the primary destinations. It SHALL NOT require an off-canvas drawer to reach the primary destinations.

#### Scenario: Primary destinations are always reachable

- **WHEN** the user is on any page at 390 px wide
- **THEN** the bottom navigation is visible
- **AND** it exposes the primary destinations (dashboard, faculties, periods, students)
- **AND** the page content is padded so the navigation does not cover it

#### Scenario: Context remains visible

- **WHEN** the user is deep in the academic hierarchy on a narrow viewport
- **THEN** the top header keeps the current context visible
- **AND** the bottom navigation still switches to the primary destinations

### Requirement: Current destination indication

The application SHALL mark the active destination in the sidebar and in the mobile bottom navigation, both visually and for assistive technology.

#### Scenario: Active navigation item is announced

- **WHEN** the user is on a page that belongs to a navigation destination
- **THEN** that destination is visually distinguished
- **AND** it exposes the current-page state to assistive technology
