# fix-build-and-svelte5-refactor Specification

## Purpose

Keep the application buildable under Svelte 5 and record the durable behaviour that came out of the build-fix refactor: a remembered light/dark theme and accessible form fields.

## Requirements

### Requirement: Application Build

The project SHALL build for production without errors, including the i18n key validation that runs before the build.

#### Scenario: Production build succeeds

- **WHEN** `pnpm build` runs
- **THEN** the i18n key validation passes
- **AND** the build completes without errors

### Requirement: Theme Preference

The application SHALL offer a light and a dark theme. The chosen theme SHALL be applied to the document root and SHALL be remembered across reloads.

#### Scenario: Toggle the theme

- **WHEN** the user toggles the theme
- **THEN** the document root switches between the light and dark variants
- **AND** every visible component adopts the corresponding colours

#### Scenario: Theme survives a reload

- **WHEN** the user reloads the page after choosing a theme
- **THEN** the previously chosen theme is applied again

#### Scenario: First visit follows the system preference

- **WHEN** no theme has been chosen yet
- **THEN** the application uses the operating system colour-scheme preference

### Requirement: Labelled Form Fields

Form controls SHALL be associated with a label so assistive technology can identify them.

#### Scenario: Delivery form fields are labelled

- **WHEN** the delivery form renders
- **THEN** every input and textarea has an associated label
- **AND** the label is linked to the control it describes
