## Context

The project is a SvelteKit-based application. We need to introduce multi-language support. We have selected `sveltekit-i18n` as the framework to implement this, as it is compatible with SvelteKit's server-side rendering and module loading.

## Goals / Non-Goals

**Goals:**

- Implement `sveltekit-i18n` in the existing SvelteKit infrastructure.
- Provide a clear directory structure for translation files (English and Spanish initially).
- Migrate validation messages (schemas) and UI labels (components) to translation files.
- Add a script to validate translation key consistency between locales.

**Non-Goals:**

- Automatic translation of existing user-generated data.
- Implementation of full browser-based language detection logic (initial scope is hardcoded/default).

## Decisions

- **Framework**: `sveltekit-i18n` was chosen for its lightweight, dependency-free nature and SSR compatibility.
- **Translation Directory**: Files will be under `src/lib/i18n/<locale>/<namespace>.json`.
- **Validation**: A custom validation script (Node/TS) will be added to the project to compare JSON keys in translation files to ensure they match across all supported languages.

## Risks / Trade-offs

- **Risk**: Missing keys in one language file.
  - **Mitigation**: Automated validation script during build or pre-commit.
- **Risk**: Performance impact of loading multiple translation files.
  - **Mitigation**: Use `sveltekit-i18n` loaders to load only necessary namespaces per route.
- **Trade-off**: Slightly higher complexity due to async loading of translations.
