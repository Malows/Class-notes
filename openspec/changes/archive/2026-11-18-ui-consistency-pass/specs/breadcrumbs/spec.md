# Spec Delta

## ADDED Requirements

### Requirement: Compact trail on narrow viewports

The system SHALL keep the user's location visible on narrow viewports by showing a compact breadcrumb trail with at least the current resource and its parent, instead of hiding the trail.

#### Scenario: Narrow viewport keeps a trail

- **WHEN** the viewport is narrow and the user is inside the hierarchy
- **THEN** the breadcrumb shows at least the current resource and its parent
- **AND** it does not disappear in favour of only the application brand and the menu toggle

#### Scenario: The compact trail navigates

- **WHEN** the user taps the parent entry of the compact trail
- **THEN** the system navigates to that parent view

#### Scenario: Wide viewport keeps the full trail

- **WHEN** the viewport is wide
- **THEN** the breadcrumb keeps showing the full path to the current resource
