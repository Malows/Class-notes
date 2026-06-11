## 1. Setup i18n Infrastructure

- [x] 1.1 Install `sveltekit-i18n` using pnpm.
- [x] 1.2 Create `src/lib/i18n/` structure with `en/` and `es/` folders.
- [x] 1.3 Implement `src/lib/i18n/config.ts` with locale loaders.
- [x] 1.4 Update `+layout.ts` (or equivalent) to initialize translations.

## 2. Localization Migration

- [x] 2.1 Extract validation messages from `src/lib/schemas/dto.schema.ts` to `src/lib/i18n/{en,es}/validation.json`.
- [x] 2.2 Refactor `dto.schema.ts` to use localized messages.
- [x] 2.3 Extract UI labels from `src/lib/components/DashboardStats.svelte` to `src/lib/i18n/{en,es}/dashboard.json`.
- [x] 2.4 Refactor `DashboardStats.svelte` to use `$t()` for labels.

## 3. Validation and Build

- [x] 3.1 Create script `scripts/validate-i18n-keys.ts` to check key consistency.
- [x] 3.2 Add validation script to `package.json` to run during build.
- [x] 3.3 Verify build passes with pnpm build.
