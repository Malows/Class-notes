# Tasks

## 1. Commission model and generation

- [ ] 1.1 Add `commissions.slug` plus the partial unique index `(subject_id, period_id, slug)` (`WHERE deletedAt IS NULL`) to `schema.ts`, add `Commission.slug` to the shared type and selects; verify `pnpm exec drizzle-kit generate` shows the column/index and `pnpm check` passes
- [ ] 1.2 Commission repository generates `slug` on `create`/`update` (scoped to subject+period, excluding its own row, numeric suffix on collision) and returns it; verify repository tests cover create, rename, in-scope collision, same slug in a different subject/period, and reuse after soft delete
- [ ] 1.3 Regenerate the migration baseline, add commission slugs to the seed, reset the dev DB, and verify `GET /api/v1/commissions` returns `slug`; add `commission_slug` to the pending-summary payload for the dashboard

## 2. Commission routing by slug

- [ ] 2.1 Add a per-scope slug lookup to `commissionsStore` and verify store tests resolve a commission by `(subject_id, period_id, slug)`
- [ ] 2.2 Rename the route param `[commission_id]` to `[commission]` (slug), and make the commissions list page plus the overview/students/correct subpages resolve slug → id in memory before their API calls; verify a deep commission URL loads the right data
- [ ] 2.3 Update all commission link builders to emit slugs (`CommissionRow`, sidebar context `buildCommissionItems`, `navStore` breadcrumbs, overview components, `DashboardPending`) and verify row and sidebar-context href tests
- [ ] 2.4 Show a not-found state (no server error) for an unknown commission slug and verify it with a render test

## 3. Nested period routing by year/semester

- [ ] 3.1 Restructure `periods/[period_id]` to `periods/[year]/[semester]` under `subjects/[subject]` (moving overview/assignments/commissions and the commission subpages one level deeper), and make each page derive the numeric period id in memory from the `(year, semester)` key; verify a nested period URL loads the right data
- [ ] 3.2 Update `navStore.context` (periodYear/periodSemester) and breadcrumbs, `SubjectPeriodRow`, sidebar period items (active by key), and the overview components to build `/periods/{year}/{semester}/...` URLs; verify nav and row href tests
- [ ] 3.3 Show a not-found state for a nested period `(year, semester)` that does not exist for the subject and verify it with a render test

## 4. Integration verification

- [ ] 4.1 Walk through the app: the full hierarchy navigates via `/faculties/{f}/subjects/{s}/periods/{year}/{semester}/commissions/{commissionSlug}`, renaming a commission regenerates its slug (suffix on collision), and unknown slugs/period keys show not-found states
- [ ] 4.2 Run `pnpm check`, `pnpm lint`, `pnpm test`, and `pnpm validate:i18n` and verify all pass with the new tests included