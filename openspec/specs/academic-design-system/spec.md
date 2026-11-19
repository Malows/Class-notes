# academic-design-system Specification

## Purpose

Define the editorial visual language of the application — Academic Notebook — including its tokens, typography, density, component conventions, status semantics, themes and assets, so every screen reads as one archival academic system.

## Requirements

### Requirement: Editorial visual language

The interface SHALL use the Academic Notebook visual language: a warm paper canvas, white content surfaces, ink text, one Ink Blue primary accent, 1 px hairline borders, a 4 px spacing grid and 4 px/8 px radii. Gradients, blurred shadows and decorative elevation SHALL NOT be used.

#### Scenario: Canvas and surface hierarchy

- **WHEN** a page renders
- **THEN** the page canvas uses the warm paper surface
- **AND** cards, tables and inspection panels sit on the crisp white surface
- **AND** their boundaries are 1 px hairlines, not shadows

#### Scenario: Feedback without elevation

- **WHEN** an interactive element is hovered or selected
- **THEN** it changes through a background tint or border change
- **AND** it does not lift, scale or add a drop shadow

### Requirement: Theme modes

The system SHALL provide light and dark themes driven by the same semantic tokens. Switching themes SHALL update every surface, text, border and semantic color without reloading the page.

#### Scenario: Theme switch

- **WHEN** the user toggles the theme
- **THEN** every component updates through the semantic tokens
- **AND** the selected theme survives navigation and reloads

#### Scenario: Dark mode remains readable

- **WHEN** the interface renders in dark mode
- **THEN** body text, secondary text, controls and semantic chips meet WCAG AA contrast on their surfaces

### Requirement: Editorial typography

Headings SHALL use the editorial serif family. Body copy, controls, tables and micro-labels SHALL use the UI sans family. Numeric values in tables and grades SHALL use tabular figures, and table and field labels SHALL use uppercase micro-label styling with positive tracking.

#### Scenario: Headings and UI type are distinct

- **WHEN** a screen presents a title and body content
- **THEN** the title uses the editorial serif face
- **AND** the surrounding UI uses the sans face

#### Scenario: Numbers align in tables

- **WHEN** a table shows legajos, grades, counts or percentages
- **THEN** the digits use tabular figures and align in their columns

### Requirement: Data density

Lists and tables SHALL use the editorial density: 40 px rows, a 32 px header row, 32–36 px form controls and toolbars, and 1 px horizontal rules. Tables SHALL NOT draw vertical cell borders.

#### Scenario: Table density

- **WHEN** a roster or list renders
- **THEN** its rows are 40 px high and its header is 32 px high
- **AND** separators are horizontal hairlines only

#### Scenario: Controls match the density

- **WHEN** a form or toolbar renders
- **THEN** its inputs, selects and buttons share the 32–36 px control height

### Requirement: Semantic status

A status SHALL be conveyed by text or an icon in addition to color. Semantic colors SHALL be reserved for their meaning and SHALL meet contrast on their own surfaces.

#### Scenario: Status is not color-only

- **WHEN** a chip, badge or grid cell communicates a state
- **THEN** it includes a readable label, glyph or pip alongside the color

#### Scenario: Consistent status vocabulary

- **WHEN** the same state appears in a legend, a chip and a grid cell
- **THEN** all three use the same word, glyph and semantic color
- **AND** assistive technology receives the state in the selected language

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

Links that navigate SHALL be visually distinguishable from controls that change data, and SHALL use the application's editorial link treatment instead of the browser default.

#### Scenario: A navigating link looks like a link

- **WHEN** a value navigates to another view (for example a person's name in a roster)
- **THEN** it uses the application's link treatment
- **AND** it does not fall back to the browser's default blue underlined text alongside the controls

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

### Requirement: Localized Feedback

Every message shown to the user, including transient confirmations and errors, SHALL be available in every supported language.

#### Scenario: Switching language translates the feedback

- **WHEN** the user switches the interface language and then triggers a success or error message
- **THEN** the message appears in the selected language

#### Scenario: No hardcoded user-facing strings

- **WHEN** a screen raises a toast or an inline message
- **THEN** its text comes from a translation key present in every language

### Requirement: Touch Targets

Interactive controls SHALL provide a target of at least 44 by 44 CSS pixels on touch viewports.

#### Scenario: Grid cells are tappable

- **WHEN** a grid renders on a touch viewport
- **THEN** each cell and each small control offers a target of at least 44 by 44 CSS pixels
- **AND** adjacent targets are separated enough to be tapped without hitting the neighbour

### Requirement: Content Measure

Page content SHALL be constrained to the editorial measure, and a row's actions SHALL stay visually associated with that row's data.

#### Scenario: Actions stay near their row on a wide viewport

- **WHEN** the viewport is much wider than the content
- **THEN** the content is constrained to the editorial maximum width
- **AND** a row's actions are not pushed to the far edge, away from that row's data

#### Scenario: The full width is used when needed

- **WHEN** a grid needs more width than the measure
- **THEN** it may scroll horizontally instead of compressing its cells

### Requirement: Icons and assets

The interface SHALL use one icon family with a consistent stroke and size. Fonts and icons SHALL be served from the application's own assets rather than a runtime CDN, and icon-only controls SHALL have an accessible name.

#### Scenario: Icons are consistent and named

- **WHEN** a control shows only an icon
- **THEN** it uses the shared icon family at the system size
- **AND** it has an accessible name in the selected language

#### Scenario: Assets work offline

- **WHEN** the app loads without access to a third-party CDN
- **THEN** the fonts and icons still render from the application's bundled assets
