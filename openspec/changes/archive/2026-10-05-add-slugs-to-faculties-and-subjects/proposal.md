# Proposal

## Why

URLs currently expose raw numeric ids (`/faculties/1/subjects/7/periods/2/...`), which are opaque, not shareable in a readable way, and cannot be looked up by anything but the internal autoincrement id. Persisting a human-readable `slug` on faculties and subjects gives the app a stable, searchable key for navigation.

## What Changes

- Add a persisted `slug` column to `faculties` and `subjects`, stored in the table and looked up by value.
- **BREAKING**: frontend routes use slugs for the faculty and subject segments — `/faculties/{facultySlug}/subjects/{subjectSlug}/...`. Old numeric URLs no longer resolve (no redirects). Period and commission segments keep numeric ids for now, so URLs are mixed.
- Slugs are generated server-side from the entity `name` (`slugify`), **regenerated on every edit**, with the entity's own row excluded from the uniqueness check; collisions get an automatic numeric suffix (e.g. `algebra-lineal-2`).
- Uniqueness: `faculties.slug` unique globally; `subjects(faculty_id, slug)` unique per faculty. Both are **partial** unique indexes (`WHERE deletedAt IS NULL`) so soft-deleted rows do not block slug reuse, matching the existing soft-delete convention.
- `navStore.context` becomes slug-based for faculty/subject (`facultySlug`, `subjectSlug`) while keeping numeric `periodId`/`commissionId`; pages and the sidebar resolve slugs to ids **in memory** via new `bySlug` store maps. `Subject` payloads gain `faculty_slug` so filtering by faculty slug needs no resolution.
- All link builders (table rows, overview components, sidebar context, breadcrumbs, dashboard pending) emit slugs instead of ids.

## Capabilities

### New Capabilities

None — this extends existing routing and entity identity.

### Modified Capabilities

- `hierarchical-navigation`: **Nested routing** — the faculty and subject URL segments are human-readable slugs resolved to ids internally, instead of numeric ids.
- `academic-hierarchy`: **Faculty Management** and **Subject Management** — faculties and subjects carry a unique, human-readable slug that identifies them in navigation.

## Impact

- Database: `slug` columns + partial unique indexes; regenerated migration baseline and seed data with slugs. The app only migrates fresh databases, so the dev DB must be reset (`class-notes.db*`).
- Server: new `slugify`/uniqueness helper; faculty and subject repositories generate slugs on `create`/`update` and select the column.
- Shared types & schemas: `Faculty.slug`, `Subject.slug`, `Subject.faculty_slug`; Zod create schemas unchanged (slug is derived, not user input).
- Client: stores gain `bySlug` maps; route params renamed to slugs; `navStore.context` and breadcrumbs become slug-aware; ~22 link-builder files and their tests updated.
- API: stays id-based; responses additionally include `slug`.
- Tests: slug helper, repository create/update behavior (suffix, self-exclusion, soft-delete reuse), nav/sidebar/row hrefs.