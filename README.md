# Class Notes

A teacher's tool for running the day-to-day of their courses: who is enrolled, which practical
assignments were taught, who delivered, what grade they got, and who showed up to class.

Everything lives in one navigable academic hierarchy and reads as a grid.

## Overview

The app is built around two axes that cross:

- **Academic structure**: Faculty → Subject → *cursada* (subject × period, e.g. `2025 · 1st`) →
  Commission (the group/room).
- **People**: a person exists once (name + optional *legajo* / student ID), and an **enrollment**
  records that they take a subject in a period, optionally assigned to a commission.

Practical assignments (TPs) belong to the *cursada*, so every commission sees the same list.
Deliveries and attendance hang off enrollments.

It is **not** an institutional student-records system: there is no official registry, no student
login, no schedules or calendar. See [docs/descripcion-aplicacion.md](docs/descripcion-aplicacion.md)
for a detailed, screen-by-screen description (in Spanish).

## Features

- **Academic hierarchy** — faculties, subjects, periods, and commissions, each with a
  human-readable slug used in URLs.
- **Student registry and enrollments** — a person can take several subjects across periods; a
  search-then-create flow reuses existing people by legajo or name instead of duplicating them.
- **Assignments and deliveries** — per-TP workflow (not dictated → waiting for students → waiting
  for correction), delivery status, grade, AI-usage level, and comments.
- **Attendance** — a tri-state record per assignment and enrollment (present / absent / not taken),
  read as a grid per commission and per cursada, with a gesture-driven take mode for phones.
- **Dashboard** — global stats and pending corrections grouped by subject.
- **Dual-language UI** (Spanish/English), light/dark theme, and a responsive "sketch" look.

## Screens

| Screen | Route |
|---|---|
| Dashboard | `/` |
| Faculties / subjects in a faculty | `/faculties`, `/faculties/{faculty}/subjects` |
| Periods of a subject | `/faculties/{faculty}/subjects/{subject}/periods` |
| Assignments of a cursada | `.../periods/{year}/{semester}/assignments` |
| Commissions of a cursada | `.../periods/{year}/{semester}/commissions` |
| Commission roster | `.../commissions/{commission}/students` |
| Delivery grid (commission / cursada) | `.../overview` |
| Correction | `.../commissions/{commission}/correct` |
| Attendance (commission / cursada / take mode) | `.../commissions/{commission}/attendance`, `.../periods/{year}/{semester}/attendance`, `.../commissions/{commission}/attendance/take` |
| Students registry | `/persons`, `/persons/{id}` |
| All periods | `/periods`, `/periods/{year}/{semester}/subjects` |

## Tech stack

- **Framework**: [Svelte 5](https://svelte.dev/) (runes) on [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [PaperCSS](https://www.getpapercss.com/) + custom CSS
- **Database**: SQLite via `better-sqlite3` + [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: Zod, on both client and server
- **Tests**: Vitest + Svelte Testing Library
- **Lint/format**: oxlint, oxfmt

## Architecture

```
page / component → client store → client service → /api/v1 route → server service → repository
```

1. **Routes and components** — presentation only; no business rules.
2. **Stores** — runes classes (`$state`, `$derived`) shared through Svelte context.
3. **Client services** — call `apiFetch`, which unwraps the `{ data }` envelope.
4. **API routes** — thin handlers in `src/routes/api/v1/**`.
5. **Server services** — business rules; **repositories** own all SQLite access.
6. **Shared types and Zod schemas** — in `src/lib/common`, usable from both sides.

## Getting started

### Prerequisites

- Node.js (latest LTS)
- [pnpm](https://pnpm.io/) — mandatory (`.npmrc` enforces it)

### Installation

```bash
git clone <repo-url>
cd class-notes
pnpm install
```

### Development

```bash
pnpm dev        # Vite dev server, seeds the database on first run
pnpm check      # tsc --noEmit + svelte-check
pnpm lint       # oxlint
pnpm format     # oxfmt
pnpm build      # validate:i18n, then vite build
```

### Tests

```bash
pnpm test:server   # one-shot, server suites
pnpm test:client   # one-shot, client suites
pnpm test          # watch mode
pnpm exec vitest run path/to/file.test.ts
```

### Database

SQLite, schema in `src/lib/server/database/schema.ts`, migrations under
`src/lib/server/database/migrations/`. Migrations and seed run **only when the database is created
from scratch**, so after a schema change delete `class-notes.db*` and restart `pnpm dev`.

```bash
pnpm db:generate   # generate a migration from the schema (review it by hand)
```

## Observability

Optional and no-op when unset; never required to run the app.

- **Client errors (Sentry/GlitchTip)** — enabled by `PUBLIC_SENTRY_ENABLED="true"` + `PUBLIC_SENTRY_DSN`.
- **Server error reporting** — `POST /api/v1/observability/error`, enabled by `SENTRY_ENABLED="true"` + `SENTRY_DSN`.
- **Analytics (Plausible via backend proxy)** — `POST /api/v1/analytics/event`, enabled by
  `PUBLIC_ANALYTICS_ENABLED="true"` + `PLAUSIBLE_HOST` + `PLAUSIBLE_DOMAIN`.

Environment variables are documented in `.env.example`.

## Development workflow (OpenSpec)

Significant changes go through **OpenSpec**: specs are the source of truth, each change has a
proposal, a design and a task list, and completed work is archived.

- Specs: `openspec/specs/`
- In-flight changes: `openspec/changes/`
- Archived changes: `openspec/changes/archive/`
- Agent conventions: [AGENTS.md](AGENTS.md)

No CI is configured (`.github/workflows/` is empty): run `pnpm check`, `pnpm lint`,
`pnpm validate:i18n` and the relevant test suites before committing.

## License

Private project — all rights reserved.
