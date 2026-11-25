# Design

## Context

See `proposal.md` — Why. Constraints that shape the approach:

- `src/lib/server/database/db.ts:62-69` only initializes the database when `NODE_ENV=development`; the compiled bundle resolves that dev flag to `false`, so in production nothing creates the schema.
- `DATABASE_NAME` comes from `$env/static/private` and is inlined at build time; the SQLite path cannot change at runtime.
- `applyDrizzleMigrations` (`migrate.ts:7`) resolves `migrations` relative to the compiled chunk (`build/server/chunks/migrations`), which no build step produces. The surrounding `try/catch` swallows the `ENOENT`, so the failure is invisible.
- The only "migration state" is "does the `faculties` table exist?", so an existing database never receives a new migration.
- `insertSeed` uses fixed ids and `onConflictDoUpdate`, so it is re-runnable and would happily pollute a real database.
- The current Dockerfile is single-stage, installs `pnpm` unpinned, copies the whole build context (no `.dockerignore`), and sets a `DATABASE_PATH` nobody reads.

## Goals / Non-Goals

**Goals:**

- One image that behaves identically anywhere, with the database location supplied at runtime.
- Explicit phases: build image → migrate → serve. A failed migration never yields a serving app.
- Schema evolution for existing databases (tracking), not a reset workflow.
- Zero possibility of demo data in production, including a production image started with `NODE_ENV=development`.

**Non-Goals:**

- `ORIGIN`, reverse proxy, TLS, rate limiting (deferred by request).
- Multi-instance/concurrent migration orchestration (single-node SQLite deployment assumed).
- Reworking the `portable-infrastructure` spec (stale single-binary wording, separate change).
- Changing the data model or seed contents.

## Decisions

### 1. Node 26 LTS + pinned pnpm 12.23.0

`node:26-alpine` is the current Active LTS ("Lithium") as of this change; `node:22` is the previous one. Alpine keeps the image small and matches the native `better-sqlite3` build in the same base (musl) used at runtime.

pnpm is pinned in two places: `packageManager: "pnpm@12.23.0"` in `package.json` (a single source of truth for contributors and Corepack-aware tooling) and an explicit `npm i -g pnpm@12.23.0` in the image, because current Node distributions no longer assume a bundled Corepack. Rationale: `npm i -g pnpm` (today) installs whatever is latest, so two builds of the same commit can differ.

Alternative rejected: `corepack enable && corepack prepare` — depends on Corepack being present in the base image and adds a network fetch at build time either way.

### 2. Four-stage Dockerfile, runtime installs production deps only

```
base      node:26-alpine, pnpm pinned, tini/dumb-init optional
deps      pnpm install --frozen-lockfile (dev + prod, needed to build)
build     pnpm build (validate:i18n + vite build)
prod-deps pnpm install --prod --frozen-lockfile (or pnpm deploy)
runtime   COPY build/, prod node_modules, package.json, migrations/, entrypoint
```

Alternatives rejected: keeping dev deps in the runtime image (size, attack surface); a single stage (build toolchain such as `python3 make g++` would ship to production).

Native module note: `better-sqlite3` must be installed in a stage using the **same** base image as runtime so the compiled `.node` matches musl/ABI. Reusing `node_modules` from `deps` into `prod-deps` via `pnpm install --prod` on top of an existing store is the cheapest way to guarantee that.

### 3. `DATABASE_PATH` is read at runtime; `DATABASE_NAME` disappears

`db.ts` reads `$env/dynamic/private` (falling back to `process.env` in scripts) and takes `DATABASE_PATH`. In production, a missing value is a startup error naming the variable; in dev/test it defaults to `class-notes.db` / `:memory:`. `.env.example` documents only `DATABASE_PATH`.

Alternative rejected: keeping `DATABASE_NAME` as a relative name (what broke the volume) or supporting both names (the ambiguity that caused the bug).

Also: `drizzle.config.ts` keeps using `DATABASE_URL` for CLI tooling, with `DATABASE_PATH` as fallback, so `pnpm db:generate`/`studio` and the runtime agree.

### 4. Migrations are a standalone step: `build/migrate.js`

A dedicated entry point compiled from the existing `migrate.ts` by a small esbuild invocation added to `pnpm build`:

```
pnpm build  ->  validate:i18n + vite build + esbuild migrate.ts -> build/migrate.js
```

- `build/migrate.js` is a plain Node ESM script that reads SQL from `MIGRATIONS_DIR` (default `/app/migrations` in the image, `src/lib/server/database/migrations` in the repo) and applies pending ones.
- The Dockerfile `COPY`s the migrations folder into `/app/migrations`, so the runtime does not depend on the source tree.
- `docker-entrypoint.sh` runs `node build/migrate.js` and only on success `exec node build/index.js`.

Alternatives considered:

- **Inline SQL in the bundle** (`import.meta.glob(..., { query: "?raw" })`): no folder to copy, but it makes the migration step a side effect of the server bundle and needs a second entry anyway.
- **Run migrations inside `db.ts` at import time**: simplest, but a failure would be a partially started server (today's bug class) and operators lose the ability to run migrations as a separate job. Rejected as the primary mechanism; `db.ts` keeps calling the same runner in dev/test for convenience.

Because the step is explicit, `docker compose run --rm app node build/migrate.js` also works for pre-deploy checks, and `entrypoint` just composes it.

### 5. Own tracking table, with baseline for legacy databases

`applyDrizzleMigrations` gains a `schema_migrations(version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)` table. `version` is the migration folder name; each file is applied inside a transaction together with its row insert.

Legacy bootstrap: when `schema_migrations` is absent but `faculties` exists (a database created by the old gate), record all shipped migrations as applied **without executing them** — that database already contains them. If `faculties` is also absent, start from a clean slate and apply everything.

Alternative rejected: drizzle's `migrate()`/`__drizzle_migrations` — it expects the generated journal at runtime and its "hash of the whole file" semantics break the tolerant `already exists` handling this project currently relies on during bootstrapping.

Keeping the existing tolerant error matching (`already exists|duplicate|index|table`) is deliberate: it covers hand-edited migration history and the legacy `flat *.sql` files.

### 6. Seed gating: dev build defaults, production never

Seeding runs only when **both** conditions hold:

1. the build is a development build (`import.meta.env.DEV`, compiled `true` only by `vite dev`), **or** `SEED_DEMO_DATA=true` is set explicitly; and
2. it was not disabled (`SEED_DEMO_DATA=false`).

`import.meta.env.DEV` is a build-time constant, which is exactly what makes a production image immune to `NODE_ENV=development` at runtime. A demo server is seeded on purpose:

```
SEED_DEMO_DATA=true node build/migrate.js      # optional, idempotent
# or
pnpm db:seed                                    # dev/CI convenience wrapper
```

Alternative rejected: gating on `NODE_ENV` alone — that is the current behavior and it is what leaks demo data into production.

### 7. Hydration happens once, at the module boundary

`db.ts` no longer decides policy. It exposes `openDatabase()` (path resolution, pragmas, verbose logging disabled in production) and the boot sequence lives in one place (`instrumentation`-style init used by dev, tests, and the entrypoint script). This removes the implicit side effect that made `import db` create files.

### 8. Image hygiene

- `.dockerignore`: `node_modules`, `build`, `.svelte-kit`, `.git`, `.env*` (except `.env.example`), `*.db*`, `coverage*`, `.playwright-cli`, `.opencode`, `docs`, `openspec`.
- `DATABASE_PATH` defaults to `/app/data/class-notes.db` in compose; the volume is `./data:/app/data`.
- `NODE_ENV=production` and `USER node` (with `chown` of `/app/data` at build so a bind mount owned by the host user still works via `user:` in compose).
- Healthcheck: `node -e "fetch('http://127.0.0.1:3000/').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"` — no extra binary in the image.
- `verbose: console.log` in `db.ts` becomes opt-in (`DB_VERBOSE=true`), since it logs every statement.

## Risks / Trade-offs

- **[Node 26 ABI / better-sqlite3 prebuilds]** → build and runtime stages share `node:26-alpine`; if prebuilds are unavailable, `pnpm` compiles from source with `python3 make g++` present only in the build stages. Fallback documented: `node:24-alpine` (also LTS) with a single-line change.
- **[pnpm 12 rewrites the lockfile]** → regenerate and commit `pnpm-lock.yaml` with the pinned version in the same commit; CI/build uses `--frozen-lockfile`, so a mismatch fails loudly instead of drifting.
- **[Baseline can hide a missing migration]** → baseline only triggers when `schema_migrations` does not exist and `faculties` does; it logs every version it marks as applied, so the operator sees the assumption.
- **[Migrations are forward-only]** → rolling back an image does not revert schema. Mitigation: tag images, take a `.backup` of the SQLite file before a deploy that includes migrations.
- **[Single-writer assumption]** → two containers migrating the same file concurrently would race; the transaction plus `PRIMARY KEY` on `version` makes the loser fail rather than corrupt. Documented: one writer container per volume.
- **[Entrypoint hides failures if not `exec`'d]** → the script uses `set -e` and `exec` so signals reach Node and a migration failure stops the container with a non-zero code.
- **[Bind-mount ownership]** → `./data` created by root would make `USER node` fail; compose sets `user: "1000:1000"` and the README documents `chown`.

## Migration Plan

1. Land the app-side changes (env, migrate step, seed gate) — dev keeps working with the existing `class-notes.db`.
2. Bump pnpm + lockfile, verify `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, server tests.
3. Build the image; run against an **empty** volume: expect migrations applied, no demo rows.
4. Restart the same container twice: expect "no pending migrations" and unchanged data.
5. Point the existing deployment at its current file: expect the baseline log line and data intact.
6. Rollback: previous image tag + `sqlite3 .backup` copy taken before the deploy. Schema stays forward.

## Open Questions

- Where the reverse proxy and `ORIGIN` fit is deferred by request; SvelteKit form actions/POSTs behind a proxy may need `ORIGIN` in a follow-up change.
- Whether a demo server should be a compose profile (`--profile demo`) rather than an env var is cosmetic and decided when the first demo server exists.
