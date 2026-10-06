# Design

## Context

See proposal.md - Why. Current state that shapes the approach:

- Every entity is identified by numeric autoincrement `id`; frontend route params (`faculty_id`, `subject_id`, `period_id`, `commission_id`) are read raw via `Number(page.params.x)` and used directly against id-based stores/services.
- `navStore.context` derives numeric ids from params and feeds `Breadcrumbs.svelte` (builds hrefs) and `Sidebar.svelte` (sibling lists + active state). ~22 non-test files build `/faculties/{id}/...` links.
- The global `/periods/{year}/{semester}/subjects` route already sets the precedent: a semantic URL key resolved to an id at the page boundary via `periodService.getByYearSemester`.
- All entities soft-delete (`deletedAt`); every query filters `deletedAt IS NULL`.
- `initializeDatabase` runs migrations + seed only when the `faculties` table is absent, so this app has **no incremental DB upgrade path** — schema changes are picked up by resetting `class-notes.db*`.
- There is no `slug` column and no `slugify` helper today.

## Goals / Non-Goals

**Goals:**
- Store a human-readable, unique `slug` on faculties and subjects and use it in the faculty/subject URL segments.
- Deterministic generation (regenerated on edit, self-excluded, auto-suffix on collision) and a lookup that is static/persisted.
- Keep the API, repositories and client services id-based; resolve slugs in memory at the page/sidebar boundary.

**Non-Goals:**
- Slugs for periods or commissions (they stay numeric in the URL) — the URL is intentionally mixed for now.
- Canonical redirects from the old numeric URLs; SSR/server-side resolution; localized or translatable slugs.

## Decisions

### 1. Stored `slug` column (not derived at resolve time)

Persist `slug` on `faculties` and `subjects` rather than recomputing `slugify(name)` during lookups. A stored value is deterministic, indexable and searchable, and avoids ambiguity when two siblings share a name. This matches the requested "static place to search".

### 2. Uniqueness scope and partial indexes

- `faculties.slug` unique globally.
- `subjects(faculty_id, slug)` unique within a faculty.
- Both are **partial** unique indexes (`WHERE deletedAt IS NULL`) so a soft-deleted row's slug is freed for reuse, consistent with the rest of the schema filtering on `deletedAt`.

### 3. Regeneration on edit, self-excluded, auto-suffix

Slug is produced from the entity `name` on every create and update. The uniqueness check excludes the entity's own row (`ne(id)`), and collisions get a numeric suffix (`algebra-lineal-2`, `-3`) so a save never fails. Consequence: renaming changes the URL.

### 4. Slug-based navigation context (Option B) + in-memory resolution

Route params become slugs (`[faculty]`, `[subject]`). `NavContext` exposes `facultySlug`/`subjectSlug` (plus numeric `periodId`/`commissionId`). Breadcrumbs build hrefs directly from slugs; the sidebar and pages resolve slug → id **in memory** via new `facultiesStore.bySlug` / `subjectsStore.bySlug` maps over lists they already load. `Subject` payloads gain `faculty_slug` so sidebar subject filtering needs no resolution.

- Alternatives considered: (A) `navStore` exposes resolved numeric ids — rejected, it would couple `navStore` to the stores; (C) SSR `+layout.ts` loads resolving slugs into `page.data` — rejected as a larger shift away from the current `onMount` + stores pattern; can be added later for SSR/deep-link robustness.

### 5. API stays id-based

Client services and `/api/v1/*` keep numeric ids; responses additionally include `slug` (and `Subject.faculty_slug`). This keeps the blast radius on the frontend routing layer.

### 6. `slugify` server-side

A single helper (server-only, e.g. `src/lib/server/utils/slug.ts`) normalizes `NFKD` → strips diacritics → lowercases → replaces non-alphanumerics with `-` → collapses/trims, with a fallback token when the result is empty (`Álgebra Lineal` → `algebra-lineal`). Repositories generate slugs on `create`/`update`; the client never slugifies.

### 7. Hard cut, no redirects

Old `/faculties/1/...` URLs stop resolving. Acceptable because this is a local, single-user app with a disposable DB; a redirect layer would add routing complexity for no real audience.

## Risks / Trade-offs

- **Rename changes the URL** (bookmarks break) → accepted per the chosen regeneration policy.
- **Mixed URL** (slug for faculty/subject, numeric id for period/commission) → intentional scoping; extending to periods/commissions later is additive.
- **Duplicate names remain allowed** → two same-named subjects become `algebra` and `algebra-2`; predictable but names are not enforced unique.
- **Slug reuse after soft-delete** → an old URL can resolve to a newly created entity with the same slug; acceptable for a local tool, flagged for awareness.
- **`navStore`/link builders are the real ripple** → every new link builder must take the parent slug (and entity slug) from the loaded data, not an id; tests must be updated alongside.
- **No incremental migration** → the change is invisible on an existing DB until `class-notes.db*` is reset; the task list calls this out explicitly.

## Migration Plan

1. Schema + types: add `slug` to `faculties`/`subjects` (+ partial unique indexes), add `slug` and `faculty_slug` to the subject select; update `Faculty`/`Subject` types.
2. Server: `slugify` + uniqueness helper; repository `create`/`update` generate slugs; select includes them.
3. DB: regenerate the migration baseline from `schema.ts`, add slugs to the seed, reset the dev DB, verify row slugs are populated.
4. Frontend: rename route params to slugs; pages resolve slug → id; `navStore.context` slug-based; stores add `bySlug`; all link builders and breadcrumbs emit slugs.
5. Verify: slug-helper tests, repository tests (suffix, self-exclusion, soft-delete reuse), nav/sidebar/row href tests; `pnpm check` + `pnpm lint` + `pnpm test` + `pnpm validate:i18n`; browser walkthrough of the full hierarchy and a rename.

## Open Questions

None blocking. Extending slugs to commissions and periods is a possible follow-up once this lands.