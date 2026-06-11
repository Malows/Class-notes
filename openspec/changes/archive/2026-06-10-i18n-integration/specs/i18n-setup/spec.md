## ADDED Requirements

### Requirement: Configure i18n infrastructure

The system SHALL use `sveltekit-i18n` to manage multi-language support.

#### Scenario: Load English translations

- **WHEN** user visits the homepage
- **THEN** system loads English translation files

#### Scenario: Load Spanish translations

- **WHEN** user visits the homepage with a Spanish locale set
- **THEN** system loads Spanish translation files

### Requirement: Translation key validation

The system SHALL provide a validation mechanism to ensure translation keys are identical between locales.

#### Scenario: Run validation script

- **WHEN** a developer runs the validation script
- **THEN** the script checks all `en/*.json` against `es/*.json` and reports any missing or mismatched keys
