# Tasks

## 1. Toolchain: Node LTS y pnpm pinneado

- [x] 1.1 Pin pnpm to `12.23.0`: add `"packageManager": "pnpm@12.23.0"` to `package.json` and verify `pnpm --version` prints `12.23.0` after a clean `pnpm install`.
- [x] 1.2 Regenerate `pnpm-lock.yaml` with the pinned pnpm and verify `pnpm install --frozen-lockfile` succeeds on a clean checkout (no lockfile drift).
- [x] 1.3 Move the Docker base image to `node:26-alpine` in every stage and verify `docker build` completes with `better-sqlite3` loaded from the runtime stage (`node -e "require('better-sqlite3')"` inside the image).
- [x] 1.4 Replace `npm install -g pnpm` with the pinned install in the image and verify the build log shows `pnpm@12.23.0` (not `latest`).

## 2. Configuración de entorno en runtime

- [x] 2.1 Read the database path from `$env/dynamic/private` / `process.env` (`DATABASE_PATH`) in `src/lib/server/database/db.ts`, keeping `:memory:` for tests and a dev default, and verify a new unit test covers the three cases (explicit path, missing in production, test mode).
- [x] 2.2 Fail fast in production when `DATABASE_PATH` is missing, naming the variable; verify the startup test asserts a non-zero exit and the message.
- [x] 2.3 Remove `DATABASE_NAME` from `db.ts`, `.env.example` and any docs, and make `drizzle.config.ts` fall back to `DATABASE_PATH`; verify `pnpm db:generate` still resolves the local file.
- [x] 2.4 Make SQL statement logging opt-in (`DB_VERBOSE`) and verify a production start logs no per-query output.

## 3. Migraciones como fase propia

- [x] 3.1 Add the `schema_migrations(version, applied_at)` tracking table to `applyDrizzleMigrations`, applying each migration and its version row in one transaction; verify the repository test asserts a second run applies nothing.
- [x] 3.2 Implement the legacy baseline (tracking table missing + `faculties` present → mark shipped migrations applied without executing) and verify it with a test built from the current schema.
- [x] 3.3 Resolve the migrations directory from `MIGRATIONS_DIR` with a repo-relative default, and verify the test suite runs from a temp directory.
- [x] 3.4 Compile `src/lib/server/database/migrate.ts` into `build/migrate.js` as part of `pnpm build` (esbuild, `better-sqlite3` external) and verify `MIGRATIONS_DIR=... node build/migrate.js` applies a fresh database and exits 0.
- [x] 3.5 Verify `build/migrate.js` exits non-zero and does not start serving when a migration throws (deliberately broken fixture).
- [x] 3.6 Update the database section of `README.md` and `AGENTS.md`: migrations are tracked and no longer require deleting `class-notes.db*`; verify both documents describe the new command and no longer mention the reset workflow.

## 4. Seed solo por opt-in

- [x] 4.1 Gate `insertSeed` behind build-time `import.meta.env.DEV` or an explicit `SEED_DEMO_DATA=true`, with `false` always winning; verify server tests cover dev default, production image with `NODE_ENV=development`, and explicit opt-in.
- [x] 4.2 Remove seeding from the production boot path and keep it in dev/test; verify `pnpm test:server` and a dev first run still produce the fixtures.
- [x] 4.3 Add a `pnpm db:seed` wrapper that runs migrations then seeds idempotently; verify running it twice leaves counts unchanged.
- [x] 4.4 Document the seeding policy in `README.md` (production never seeds, demo servers opt in) and verify the commands in the doc run as written.

## 5. Imagen y fases Docker

- [x] 5.1 Rewrite `Dockerfile` as `base`/`deps`/`build`/`prod-deps`/`runtime` with production-only `node_modules`, `COPY` of the app build and the migrations folder into `/app/migrations`, non-root user and `NODE_ENV=production`; verify `docker build` succeeds and `docker run --rm <img> ls /app` shows no source tree.
- [x] 5.2 Add `.dockerignore` (`node_modules`, `build`, `.svelte-kit`, `.git`, `.env*` except `.env.example`, `*.db*`, `coverage*`, `.playwright-cli`, `.opencode`, `docs`, `openspec`) and verify the build context size drops and no `.env`/`.db` exists in the image.
- [x] 5.3 Add `docker-entrypoint.sh` (`set -e`, run `node build/migrate.js`, then `exec node build/index.js`) and verify a failing migration keeps the container from serving.
- [x] 5.4 Update `docker-compose.yaml`: `DATABASE_PATH=/app/data/class-notes.db`, `./data:/app/data` volume, `restart: unless-stopped`, `user: "1000:1000"`, healthcheck hitting `/`; verify `docker compose up` reports healthy.
- [x] 5.5 Verify persistence: create data, `docker compose up --force-recreate`, confirm the rows are still there and the log shows no pending migrations.
- [x] 5.6 Document the deploy sequence (build → migrate → serve → verify) and the `.backup` step in `README.md`, and verify the steps work as written on an empty `./data`.

## 6. Verificación de integración

- [x] 6.1 Run `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`; all pass with no new warnings.
- [x] 6.2 Build the image from a clean clone without `.env` and verify it starts, migrates, and serves an empty database (no demo faculties).
- [x] 6.3 Start the same image with `NODE_ENV=development` and verify no demo data is inserted.
- [x] 6.4 Point the image at a database created by the previous release and verify the baseline log line appears, data is intact and one new migration applies cleanly.

## Workflow follow-up

- Sync the capability delta into `openspec/specs/` and archive the change after the repo's review requirements are met.
