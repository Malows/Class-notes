# breadcrumbs Specification

## Purpose

Provide visual context and hierarchical navigation links to the user through a dynamic breadcrumb trail based on the current application state and routing.

## Requirements

### Requirement: Name-based breadcrumbs

The system SHALL display a breadcrumb trail at the top of the application showing the hierarchical path to the current resource using names instead of IDs.

#### Scenario: Display full breadcrumb path

- **WHEN** user is at `/faculties/1/subjects/2/periods/3/commissions/4/overview`
- **THEN** breadcrumb SHALL show `Home / [Faculty Name] / [Subject Name] / [Period Year-Sem] / [Commission Name] / Overview`

### Requirement: Breadcrumb navigation

Each element in the breadcrumb SHALL be a clickable link to its respective view.

#### Scenario: Navigate back via breadcrumb

- **WHEN** user clicks on the `[Subject Name]` part of the breadcrumb
- **THEN** system SHALL navigate to the Subject detail view.

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
