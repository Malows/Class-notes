# Design

## Context

See proposal.md - Why for motivation. Relevant current state:

- `periodService.getById` (client) calls `GET /api/v1/periods/{id}`, but the server route only implements `PUT`/`DELETE`; server-side there is no `getById` in repository or service. Git history confirms the GET handler never existed.
- Global period routes live at `/periods/[id]/subjects`; deep routes use `/faculties/[f]/subjects/[s]/periods/[p]/...`.
- Periods are **shared** across subjects via `subject_periods`: one `periods` row per `(year, semester)`, many subject links. The seed data honors this today, but there is no DB constraint enforcing it.
- The sidebar (`Sidebar.svelte`) renders from module-level store singletons (`subjectsStore`, `periodsStore`, `commissionsStore`) that no page ever loads — pages use separate instances provided via Svelte context (`initStoreContext`). The active-quarter section comes from SSR metadata (`getActiveMetadata`), whose filter only matches January (sem 1) or February (sem 2), so it is empty almost all year.
- Committed migrations drifted from `schema.ts`: `commissions` lacks `subject_id`, the `assignments.workflow_status` CHECK allows only 3 of the 5 statuses the app uses, and `drizzle.config.ts` points at a nonexistent `schema.drizzle.ts` (so `pnpm db:generate` is broken and the drift went unnoticed). Seed failures are silently swallowed by `runSafe`, leaving `commissions`/`students`/`assignments`/`deliveries` empty.

## Goals / Non-Goals

**Goals:**
- Make the period-subjects flow work end to end with a real `GET /api/v1/periods/{id}`.
- Adopt semantic global period URLs `/periods/{year}/{semester}` resolving to the internal id (Option A), replacing `/periods/{id}` in the global area.
- Make the sidebar quick access render real, clickable siblings (active-quarter subjects, periods, commissions).
- Reconcile migrations/schema so a fresh seed actually persists commissions, students, assignments, and deliveries.

**Non-Goals:**
- Per-subject periods that may repeat `(year, semester)`: out of scope; the domain keeps one shared period per `(year, semester)`.
- i18n cleanup of hardcoded Spanish strings in components.
- Sidebar/mobile UI redesign beyond what the quick-access sections need.

## Decisions

### 1. Add `getById` at repository → service → API route

Add `getById(id)` to `periodRepository` (select `id, year, semester` where `deletedAt IS NULL`), expose it in `periodService`, and add a `GET` handler to `src/routes/api/v1/periods/[id]/+server.ts` returning `{ data: period }` or 404.

- **Alternative considered**: make the subjects page load the period from the subjects response — rejected: leaves the client/API contract broken and gives no reusable endpoint.
- **Why repository→service→route**: matches the existing layering; the route stays thin.

### 2. Semantic period URLs `/periods/{year}/{semester}` (Option A)

- Reparent the route: `src/routes/periods/[year]/[semester]/subjects` (SvelteKit `[year]` and `[semester]` string params). The internal id is resolved at load time.
- Resolution endpoint: extend `GET /api/v1/periods` to accept `?year=&semester=` (or a dedicated `getByYearSemester` route). While added anyway, `getById` is the safer fit for the subjects page; the year/semester resolution is what the new page needs, so expose `getByYearSemester` in service + repository and a query-param variant of `GET /api/v1/periods`. Returns the matching period or `{ error: "Period not found" }` (404).
- `PeriodRow`/`PeriodTable` links change from `/periods/{id}/subjects` to `/periods/{year}/{semester}/subjects`.
- **Why resolve instead of storing slugs**: no schema change needed to show human URLs; id stays internal. Matches "Nested routing" requirement.
- **Uniqueness**: enforce `(year, semester)` uniqueness with a migration (unique index). The subject `periods` row is global by design (subject_periods joins), so this is a domain invariant, not a limitation. Resolution still tolerates duplicates (takes the first) as a safety net.
- **Deep links with ids stay unchanged** (`/faculties/[f]/subjects/[s]/periods/[p]/...`): those already carry full context and are covered by the existing "Deep link availability" scenario.

### 3. "Materias" action in subject-scoped periods table

Change `SubjectPeriodRow`'s `Materias` button from `onEdit(period)` to a `Button href="/periods/{year}/{semester}/subjects"`. The row already has `year`/`semester` on the period object; no extra fetch needed.

- **Alternative considered**: a subject-scoped route `.../periods/{p}/subjects` reusing the same page pre-filtered by subject — rejected for now: duplicates the global view with no distinct behavior; revisit if teachers want the view pre-scoped.

### 4. Sidebar quick access: real data + correct active quarter

Two independent fixes:

- **Active quarter (`getActiveMetadata`)**: replace the January/February-only filter with calendar-based semester selection for the southern academic year (confirmed with the user):
  - month 3–7 → current year, semester 1
  - month 8–12 → current year, semester 2
  - month 1–2 → previous year, semester 2
  Then query the periods of that `(year, semester)` with their subjects (existing joins), fall back to `{ periodData: null, subjects: [] }` when none. The month boundaries live in a single constant.
- **Sibling sections**: make `Sidebar.svelte` consume the **same store instances the pages use** (via `getContext`, which is available since the sidebar lives inside `+layout.svelte` where `initStoreContext()` runs), and trigger a protected `load()` per store for the current context (guard on `loaded` to avoid refetch). This reuses the existing stores/services (no new payload shape) and stays reactive when pages mutate data.
- **Alternative considered**: extend the SSR metadata payload with all sibling sections and render the sidebar purely from it — rejected as a bigger change (new payload shape everywhere) with the same end result; the stores already exist and pages already populate them.

### 5. Database reconciliation

- Fix `drizzle.config.ts` → `schema: "./src/lib/server/database/schema.ts"`, then regenerate (`pnpm db:generate`) and commit new migrations that:
  - add `commissions.subject_id` (FK subjects, NOT NULL) — dev DBs are disposable, so no backfill needed besides a reset;
  - widen `assignments.workflow_status` (and `deliveries`, already includes them) CHECK to the 5 statuses the app uses (`NOT_DICTATED`, `WAITING_FOR_STUDENTS`, `WAITING_FOR_CORRECTION`, `APPROVED`, `REJECTED`) — SQLite CHECK changes require table recreation in the migration;
  - add a unique index on `periods (year, semester)`.
- Delete/reset the local `class-notes.db` (dev only) so the fresh init applies migrations + seed; document this step for the developer instead of making it automatic.
- Keep `runSafe` swallowing behavior explicit: it's what hid this drift, so the regeneration + `pnpm validate` + a smoke test asserting non-empty commissions/students are the guardrails going forward.

## Risks / Trade-offs

- **`(year, semester)` not globally unique if the domain changes later** → unique index + first-match resolution; documented non-goal that per-subject repeated periods are unsupported.
- **CHECK widening via table recreation** → recreating `assignments`/`deliveries` must preserve FKs and data; migration tested against the dev DB before merging.
- **Sidebar triggering store loads** could duplicate page loads → the `loaded` guard prevents refetch; worst case one redundant request per navigation.
- **Active-quarter boundaries are confirmed** (sem 1 = Mar–Jul, sem 2 = Aug–Dec, Jan–Feb → prev year sem 2) → stored as one tunable constant in case the calendar ever changes.
- **DB reset loses local data** → dev-only, seeded data is reproducible; call it out in the task so it's a conscious step.

## Migration Plan

1. Apply backend changes (endpoint, resolution) with tests; verify `GET /api/v1/periods/{id}` and `GET /api/v1/periods?year=&semester=`.
2. Reparent routes to `/periods/[year]/[semester]`; update links.
3. Sidebar fixes (active quarter + context stores).
4. Drizzle config fix → regenerate migrations → reset dev DB → run seed → smoke-test all views.
5. `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm validate:i18n` before merge.

## Open Questions

None. The active-quarter calendar was confirmed with the user: semester 1 = months 3–7, semester 2 = months 8–12, months 1–2 fall back to the previous year's semester 2 (see Decisions §4).