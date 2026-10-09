# Proposal

## Why

Navigation URLs are still opaque at two levels: nested period routes under a faculty/subject use the numeric `period_id` (only the global `/periods/{year}/{semester}` route is semantic), and commissions use numeric `commission_id`. Completing readable URLs removes the remaining random ids from navigation and keeps one consistent URL convention across the whole hierarchy.

## What Changes

- **BREAKING**: nested period routes under `faculties/{faculty}/subjects/{subject}` switch from `periods/{period_id}` to `periods/{year}/{semester}` (two segments, matching the existing global `/periods/{year}/{semester}`). Pages resolve the `(year, semester)` key to the numeric period id in memory for the id-based API calls.
- **BREAKING**: commissions switch from `commissions/{commission_id}` to `commissions/{commissionSlug}`. Commissions gain a stored, human-readable `slug` derived from their name — globally unique per `(subject_id, period_id)`, enforced with a partial unique index (`WHERE deletedAt IS NULL`), regenerated on every edit (excluding the row itself, automatic numeric suffix on collision), mirroring the faculty/subject slug policy.
- Target URL: `/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{year}/{semester}/commissions/{commissionSlug}/overview`.
- The query parameters on `/correct` (`assignment_id`, `student_id`) stay numeric; assignments and students keep no frontend path segment.
- The commissions API stays id-based; responses additionally include `slug`.

## Capabilities

### New Capabilities

None — this extends existing routing and entity identity.

### Modified Capabilities

- `hierarchical-navigation`: **Nested routing** — nested period segments use the `{year}/{semester}` key and commission segments use slugs.
- `academic-hierarchy`: **Period and Commission Management** — commissions carry a unique slug derived from their name, regenerated on edit.

## Impact

- Database: `commissions.slug` column + partial unique index on `(subject_id, period_id, slug)`; regenerated migration baseline and seed data with commission slugs; dev DB reset required (the app only migrates fresh databases).
- Server: commission repository generates/selects `slug`; shared `Commission` type gains `slug`; the pending-summary payload gains `commission_slug` for dashboard links.
- Client: `commissionsStore` gains an in-scope slug lookup; routes renamed (`[period_id]` → `[year]/[semester]`, `[commission_id]` → `[commission]`); pages resolve keys and slugs in memory; `navStore.context` exposes `periodYear`/`periodSemester`/`commissionSlug` and breadcrumbs emit readable URLs; link builders (rows, sidebar-context, overview components, dashboard pending) updated.
- Tests: commission slug generation, route/href assertions, in-memory resolution for periods and commissions.