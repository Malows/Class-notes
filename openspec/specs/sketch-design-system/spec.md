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

### Requirement: Page Header

Every screen SHALL present its title, an optional supporting line and its primary action in a single header, using the same type scale and placement across screens.

#### Scenario: Title and primary action share the header

- **WHEN** a screen renders its content
- **THEN** the screen title is the most prominent text inside the content area
- **AND** the primary action sits in the same header as the title

#### Scenario: Consistent across screen types

- **WHEN** the user moves between a list, a grid and a detail screen
- **THEN** the title keeps the same scale and vertical position
- **AND** the primary action keeps the same placement

#### Scenario: Narrow viewport keeps the header usable

- **WHEN** the viewport is narrow
- **THEN** the title and the primary action remain visible without overlapping each other or the content below

### Requirement: List Row Actions

A list row SHALL expose at most one primary action directly and SHALL group the remaining actions behind a single disclosure. Destructive actions SHALL NOT sit next to non-destructive ones without visual separation.

#### Scenario: One primary action plus a disclosure

- **WHEN** a row offers more than one action
- **THEN** exactly one action is shown directly as the row's primary action
- **AND** the remaining actions are reachable through a single disclosure control

#### Scenario: Destructive action is separated

- **WHEN** a row offers a destructive action
- **THEN** it is not placed adjacent to a non-destructive action without a separator or a distinct treatment
- **AND** it still asks for confirmation before acting

#### Scenario: The disclosure is reachable

- **WHEN** the user reaches the row with a keyboard or a screen reader
- **THEN** the disclosure can be opened and announces that it contains more actions

### Requirement: Link Treatment

Links that navigate SHALL be visually distinguishable from controls that change data, and SHALL use the application's link treatment instead of the browser default.

#### Scenario: A navigating link looks like a link

- **WHEN** a value navigates to another view (for example a person's name in a roster)
- **THEN** it uses the application's link treatment
- **AND** it does not fall back to the browser's default blue underlined text alongside sketch-styled controls

#### Scenario: A mutating control looks like a control

- **WHEN** an element changes data (create, edit, delete, assign)
- **THEN** it is presented as a control, not as a navigating link

### Requirement: Empty States

A list or grid with no data SHALL render an empty state that names what is missing and offers at least one action that creates it.

#### Scenario: Empty roster offers enrolling

- **WHEN** a commission has no enrollments
- **THEN** the empty state says so and offers the action that adds them

#### Scenario: Empty grid offers defining assignments

- **WHEN** a cursada has no practical assignments
- **THEN** the empty state says so and offers the action that defines them

#### Scenario: No bare sentences

- **WHEN** a collection renders empty
- **THEN** the screen does not present only a sentence with no way forward

### Requirement: Touch Targets

Interactive controls SHALL provide a target of at least 44 by 44 CSS pixels on touch viewports.

#### Scenario: Grid cells are tappable

- **WHEN** a grid renders on a touch viewport
- **THEN** each cell and each small control offers a target of at least 44 by 44 CSS pixels
- **AND** adjacent targets are separated enough to be tapped without hitting the neighbour

### Requirement: Localized Feedback

Every message shown to the user, including transient confirmations and errors, SHALL be available in every supported language.

#### Scenario: Switching language translates the feedback

- **WHEN** the user switches the interface language and then triggers a success or error message
- **THEN** the message appears in the selected language

#### Scenario: No hardcoded user-facing strings

- **WHEN** a screen raises a toast or an inline message
- **THEN** its text comes from a translation key present in every language

### Requirement: Content Measure

Page content SHALL be constrained to a readable measure, and a row's actions SHALL stay visually associated with that row's data.

#### Scenario: Actions stay near their row on a wide viewport

- **WHEN** the viewport is much wider than the content
- **THEN** the content is constrained to a readable measure
- **AND** a row's actions are not pushed to the far edge, away from that row's data

#### Scenario: The full width is used when needed

- **WHEN** a grid needs more width than the measure
- **THEN** it may scroll horizontally instead of compressing its cells
