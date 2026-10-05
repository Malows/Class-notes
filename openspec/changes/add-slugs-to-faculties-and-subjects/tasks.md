# Tasks

## 1. Slug helper and schema

- [x] 1.1 Add a server-side `slugify` + slug-uniqueness helper (e.g. `src/lib/server/utils/slug.ts`) and verify unit tests cover diacritics (`Álgebra` → `algebra`), whitespace/punctuation, the empty-name fallback, and numeric suffixing
- [x] 1.2 Add `slug` columns plus partial unique indexes (`WHERE deletedAt IS NULL`) to `faculties` and `subjects` in `schema.ts`, and add `slug` (and `Subject.faculty_slug`) to shared types and repository selects; verify `pnpm exec drizzle-kit generate` shows the columns/indexes and `pnpm check` passes

## 2. Repository slug generation

- [x] 2.1 Faculty repository generates `slug` on `create`/`update` (regenerated from name, excluding its own row, suffix on collision) and returns it; verify repository tests cover create, rename to a free slug, rename colliding with another faculty, and slug reuse after soft delete
- [x] 2.2 Subject repository does the same scoped to `(faculty_id, slug)` and selects `slug`/`faculty_name`; verify repository tests cover create, rename, intra-faculty collision, and that the same slug is allowed in a different faculty

## 3. Database baseline and seed

- [x] 3.1 Regenerate the migration baseline from `schema.ts` and add `slug` to the faculty/subject seed data; verify a fresh SQLite database has the columns, the partial indexes, and non-empty unique slugs after seeding
- [x] 3.2 Reset the dev DB (`class-notes.db*`) and restart `pnpm dev`; verify via the API that `GET /api/v1/faculties` and `/subjects` return `slug` (and `faculty_slug` on subjects)

## 4. Slug-based routing and resolution

- [x] 4.1 Add `bySlug` derived maps to `facultiesStore` and `subjectsStore` and expose `faculty_slug` filtering; verify store tests resolve entities by slug
- [ ] 4.2 Rename the route params to `[faculty]`/`[subject]` slugs and make each affected page resolve slug → id in memory before its scoped calls; verify a deep page (e.g. `/faculties/{facultySlug}/subjects/{subjectSlug}/periods`) loads the right data
- [ ] 4.3 Make `navStore.context` slug-based (`facultySlug`/`subjectSlug` + numeric `periodId`/`commissionId`) and make `navStore.breadcrumbs` emit slug URLs; verify nav store tests
- [ ] 4.4 Update all link builders (table rows, overview components, sidebar context, dashboard pending, pages) to emit slugs; verify row and sidebar-context href tests
- [ ] 4.5 Show a not-found state (no server error) for an unknown faculty/subject slug and verify it with a render test

## 5. Integration verification

- [ ] 5.1 Walk through the app: the full hierarchy navigates via slugs, and renaming a faculty/subject updates its slug (and appends a suffix on collision) without breaking navigation
- [ ] 5.2 Run `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm validate:i18n` and verify all pass with the new tests included