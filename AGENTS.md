# OpenCode Agent Guide for ClassNotes

- Use pnpm for everything. The key scripts are `pnpm dev`, `pnpm validate:i18n`, `pnpm lint`, `pnpm test`, `pnpm build`, and the focused Vitest shortcuts `pnpm test:repository`, `pnpm test:api`, `pnpm test:store`, and `pnpm test:ui`. `pnpm build` runs `validate:i18n` first.
- This is a SvelteKit 5 app with runes. Follow the existing flow: route/component -> store -> service -> repository; keep business logic out of components.
- Shared UI lives in `src/lib/components`, global state in `src/lib/stores`, API/business logic in `src/lib/services`, and SQLite access in `src/lib/server/repositories`.
- Prefer the matching store over prop drilling when shared state already exists.
- Backend endpoints under `src/routes/api/v1/*` should stay thin; repositories own SQLite access and services own business rules.
- If you change the academic hierarchy (`faculties` -> `subjects` -> `periods` -> `commissions`/`assignments`), update the related types, stores, services, repositories, and tests together.
- i18n files are under `src/lib/i18n/{en,es}`. If you add or rename keys, run `pnpm validate:i18n`.
- Significant changes should use OpenSpec artifacts under `openspec/changes` and `openspec/specs`; completed work is archived under `openspec/changes/archive`.
