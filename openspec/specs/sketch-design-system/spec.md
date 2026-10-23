# sketch-design-system Specification

## Purpose

Define the visual language of the application: one set of CSS custom properties consumed by every component, plus the reusable primitives (card, button, badge) that carry the hand-drawn aesthetic in both light and dark mode.

## Requirements

### Requirement: Global Design System

The system SHALL implement a unified design aesthetic using CSS custom properties for consistency across light and dark modes.

#### Scenario: Theme switching

- **WHEN** user toggles between light and dark mode
- **THEN** all components (cards, buttons, sidebar) SHALL update colors seamlessly using defined CSS variables

### Requirement: Atomic UI Components

The system SHALL provide reusable components (Card, Button, Badge) that enforce the "sketchy" aesthetic.

#### Scenario: Card rendering

- **WHEN** a Card component is used
- **THEN** it SHALL render with the irregular border-radius and border weight defined in the system
