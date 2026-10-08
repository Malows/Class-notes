# Design

## Context

See proposal.md - Why. Current state:

- Faculty and subject URL segments are slugs already (`/faculties/{facultySlug}/subjects/{subjectSlug}`), resolved in memory via `bySlug` store maps; `navStore.context` carries `facultySlug`/`subjectSlug` + numeric `periodId`/`commissionId`.
- The global period route is semantic already (`/periods/{year}/{semester}/subjects`), resolving via `periodService.getByYearSemester`. Nested period routes still use `[period_id]` and commissions use `[commission_id]`; six pages parse `page.params.period_id`, and ~7 link builders embed `period.id`/`periodId`/`commission.id`.
- `(year, semester)` is globally unique (index); the `Period` object carries `year`/`semester` everywhere it is used to build URLs.
- `Commission` has `name` (editable), belongs to `(subject_id, period_id)`, and has no slug today; names repeat across periods.
- Soft delete is universal; slug uniqueness must be a partial index (`WHERE deletedAt IS NULL`), as done for faculties/subjects.
- The app only runs migrations on fresh databases; schema changes require a dev DB reset.

## Goals / Non-Goals

**Goals:**
- Nested period routes use `{year}/{semester}` (two segments, consistent with the global route) and commissions use slugs, so no numeric id appears in navigation paths.
- Commissions are addressable by a readable, stored, unique-in-scope slug with the same regeneration/collision policy as faculties/subjects.

**Non-Goals:**
- Slugs for assignments or students (no frontend path segment; `/correct` keeps numeric `assignment_id`/`student_id` query params).
- Changing the id-based API surface or the global `/periods/{year}/{semester}` route (already semantic).

## Decisions

### 1. Nested periods use `{year}/{semester}` (two segments)

`periods/[period_id]/...` becomes `periods/[year]/[semester]/...`, stacking one extra path level (e.g. `/faculties/{f}/subjects/{s}/periods/2026/1/commissions`). Resolution: pages load `periodsStore` for the subject and derive `periodID` by `periodsStore.items.find(p => p.year === y && p.semester === s)?.id`; the API calls stay id-based.

- Alternative considered: single segment key `{year}-{semester}` ("2026-1") — rejected to avoid creating a second convention alongside the global `/periods/{year}/{semester}`.
- `navStore.context` becomes `periodYear`/`periodSemester` (strings), and breadcrumbs emit the readable path directly.

### 2. Commissions gain a stored slug

Mirrors the faculty/subject policy: `commissions.slug` column, partial unique index on `(subject_id, period_id, slug)` `WHERE deletedAt IS NULL`, generated in the repository from the name on create/update (self-excluded, automatic numeric suffix). `Commission` type and repository selects gain `slug`; `commissionsStore` gains a per-scope `bySlug` lookup (filtering loaded items by subject+period).

### 3. Routing restructure and resolution

- `[commission_id]` → `[commission]` (slug); pages under `/commissions/[commission]/...` resolve slug → id via `commissionsStore` loaded items (scoped by subject+period).
- The three commission subpages (overview, students, correct) and the commissions list page resolve both the nested `(year, semester)` period and the commission slug.
- `navStore.context` adds `commissionSlug`; sidebar commission items become active by slug comparison; breadcrumbs build `/faculties/{f}/subjects/{s}/periods/{year}/{semester}/commissions/{commissionSlug}/...`.
- Link builders: `SubjectPeriodRow` and sidebar period items already have `year`/`semester`; `CommissionRow` and overview components switch `commission.id`/`periodId` to `commission.slug`/`{year}/{semester}` for hrefs; the pending-summary payload gains `commission_slug` (and keeps numeric ids for the API).

### 4. No-new-column for periods; one new column for commissions

Periods reuse the natural key (no schema change). Commissions add `slug` + partial index; the migration baseline is regenerated from `schema.ts`, seed adds commission slugs, and the dev DB is reset.

## Risks / Trade-offs

- **URLs get one level deeper** (period now two segments) → accepted for full consistency; nothing else changes.
- **Renaming a commission changes its URL** (regeneration policy) → accepted, same as faculties/subjects.
- **Duplicate commission names stay allowed** → suffix (`comision-a`, `comision-a-2`), predictable.
- **Sidebar active-state logic keyed by year+semester / slug** instead of ids → covered by nav/sidebar-context tests.
- **CSS/data couplings**: the commissions page filter and `GuardWrapper` conditions must resolve slugs/keys to ids; verified via route + render tests.
- **No incremental DB migration** → dev DB reset is part of the tasks.

## Migration Plan

1. Commissions model: `slug` column + partial index in `schema.ts`; `Commission.slug` type; repository generation/selects; seed slugs; regenerate baseline; reset DB.
2. Commissions routing: `[commission]` param, in-scope resolution, link builders, not-found for unknown slug.
3. Period routing: `[year]/[semester]` restructuring, page resolution, `navStore`/breadcrumbs, link builders, not-found for unknown period key.
4. Verify: commission slug generation tests, route/href tests, full hierarchy walkthrough (including rename + collision), and `pnpm check`/`lint`/`test`/`validate:i18n`.

## Open Questions

None blocking. Extending slugs to assignments/students is a possible future follow-up if a per-item route ever appears.