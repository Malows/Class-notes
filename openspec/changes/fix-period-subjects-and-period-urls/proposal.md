# Proposal

## Why

The period-subjects flow is broken end to end: opening `/periods/{id}/subjects` fails because `GET /api/v1/periods/{id}` has no handler (405), so teachers cannot see the subjects linked to each period. The sidebar "Acceso rápido" is also effectively broken — it shows empty lists or "no active context" — and the committed DB migrations have drifted from `schema.ts`, so commissions, students, assignments, and deliveries are silently missing from seeded databases. Together these make the core academic views (periods, commissions, students, TPs) look empty or fail outright.

## What Changes

- **Add missing `GET /api/v1/periods/{id}`** endpoint (repository `getById` + service + server route) so `/periods/{id}/subjects` loads period info instead of 405ing. **This unblocks viewing/managing the subjects of a period.**
- **Replace the numeric period URL with a semantic one**: the global period routes become `/periods/{year}/{semester}` (e.g. `/periods/2026/2`), resolving `(year, semester)` to the internal period id (Option A). Existing `/periods/{id}` deep links inside faculty/subject context keep their ids; only the global `/periods` views adopt the year/semester scheme.
- **Fix the "Materias" action** in `SubjectPeriodRow` (subject-scoped periods table): it currently opens the edit modal; it must navigate to the period-subjects view instead.
- **Make the sidebar quick access work**: fix `getActiveMetadata` so the active quarter is selected correctly (today it only matches January/February), and ensure the context sections (subjects/periods/commissions) render real data — the sidebar currently reads module store singletons that pages never load. Subjects of the active quarter get direct links.
- **Reconcile database schema with migrations**: fix `drizzle.config.ts` (points at a nonexistent `schema.drizzle.ts`), regenerate migrations so `commissions.subject_id` exists and `workflow_status` CHECK constraints match the 5 statuses the app uses (`APPROVED`, `REJECTED` included), and make seeded data actually persist so commissions/students/assignments/deliveries are not silently lost.

## Capabilities

### New Capabilities

None — all behavior changes extend existing capabilities.

### Modified Capabilities

- `hierarchical-navigation`: **Nested routing** — the global period routes adopt the `{year}/{semester}` URL scheme (resolved internally to the period id); **Context-aware sidebar** — the sidebar quick access must render actual sibling resources (active-quarter subjects, periods, commissions) with direct links, instead of empty lists or a "no active context" fallback.
- `academic-hierarchy`: **Period and Commission Management** — the subjects-of-a-period view must load successfully (new `GET /api/v1/periods/{id}`), the "Materias" action must navigate instead of editing, and the period ↔ subject association must be viewable/manageable end to end. Data integrity (migrations aligned with `schema.ts`, seed persisting commissions/students/assignments/deliveries) is required for these views to show real data.

## Impact

- API: `src/routes/api/v1/periods/[id]/+server.ts` gains `GET`; `period.service.ts`/`period.repository.ts` gain `getById`.
- Routing: `src/routes/periods/[year]/[semester]/subjects` (replaces `[id]` variant); `PeriodRow` links; `period.service.ts` gains year+semester resolution.
- Components: `SubjectPeriodRow.svelte` ("Materias" action), `Sidebar.svelte` + `sidebar-context.ts` (real data + active quarter), `metadata` wiring.
- Database: `drizzle.config.ts` fix, regenerated migrations (`commissions.subject_id`, workflow status CHECK), seed reliability; local `class-notes.db` needs a reset to pick up the changes.
- Tests: repository/API tests for the new GET endpoint and year/semester resolution; component/UI tests for the sidebar and "Materias" action.