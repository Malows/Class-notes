## Why

The project currently supports only one language. Adding internationalization (i18n) will allow for multi-language support, improving accessibility and user reach for different regions.

## What Changes

- Install `sveltekit-i18n` to manage multi-language translations.
- Implement i18n infrastructure in SvelteKit.
- Extract strings from schemas (Zod validation messages) and UI components into translation files (`en/`, `es/`).
- Create a validation script to ensure consistency of translation keys between languages.

## Capabilities

### New Capabilities

- `i18n-setup`: Configuration and infrastructure for internationalization.
- `i18n-localization`: Migration of strings to translation files for academic/dashboard domains.

### Modified Capabilities

- `assignment-management`: Requirement for UI strings to be localized.
- `dashboard`: Requirement for UI strings to be localized.

## Impact

- `src/lib/` components and schemas will import translations instead of using static strings.
- New dependencies added via `pnpm`.
- Build process updated to include translation key validation.
