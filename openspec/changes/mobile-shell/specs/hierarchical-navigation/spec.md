# Spec Delta

## ADDED Requirements

### Requirement: Mobile navigation drawer

On narrow viewports the sidebar SHALL behave as an off-canvas overlay drawer over the page content, with an opaque surface and a backdrop between the drawer and the page.

#### Scenario: Drawer covers the page instead of blending into it

- **WHEN** the user opens the sidebar at 390 px wide
- **THEN** the drawer renders over the page content with an opaque background
- **AND** the page behind it is visually separated by a backdrop
- **AND** underlying page text is not readable through the drawer

#### Scenario: Drawer is unavailable while closed

- **WHEN** the drawer is closed on a narrow viewport
- **THEN** it stays outside the visible viewport
- **AND** it does not create horizontal page scrolling

### Requirement: Drawer dismissal and focus return

The open drawer SHALL be dismissible with Escape, a backdrop click, or a route change, and closing it SHALL return focus to the navbar menu control.

#### Scenario: Escape closes the drawer

- **WHEN** the drawer is open and the user presses Escape
- **THEN** the drawer closes
- **AND** focus moves to the navbar menu control

#### Scenario: Backdrop click closes the drawer

- **WHEN** the drawer is open and the user activates the backdrop
- **THEN** the drawer closes

#### Scenario: Navigating closes the drawer

- **WHEN** the user follows a link inside the drawer
- **THEN** the route changes and the drawer closes

#### Scenario: Menu control announces the state

- **WHEN** the drawer opens or closes
- **THEN** the navbar menu control exposes the resulting expanded or collapsed state

### Requirement: Drawer background isolation

While the mobile drawer is open, the page behind it SHALL NOT be interactive or scrollable.

#### Scenario: Focus cannot reach the page behind the drawer

- **WHEN** the drawer is open
- **THEN** the main page content is inert
- **AND** keyboard focus stays outside that content

#### Scenario: Background does not scroll

- **WHEN** the drawer is open and the user scrolls
- **THEN** the underlying page does not move

### Requirement: Sidebar collapse control

The sidebar's collapse and expand control SHALL have an accessible name that states its action and SHALL meet the touch target minimum on touch viewports.

#### Scenario: Collapse control is announced

- **WHEN** a screen reader reaches the collapse or expand control
- **THEN** its name communicates whether it collapses or expands the sidebar

#### Scenario: Collapse control is tappable

- **WHEN** the control renders on a touch viewport
- **THEN** its target is at least 44 by 44 CSS pixels
