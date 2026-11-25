import Database from "better-sqlite3";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const MIGRATIONS_DIR_ENV = "MIGRATIONS_DIR";
export const MIGRATIONS_TABLE = "schema_migrations";

/**
 * Errors that mean "this SQL was already applied by a previous lifecycle"
 * (hand-edited history, legacy flat files, a database bootstrapped before
 * tracking existed). They are recorded as applied instead of aborting.
 */
const ALREADY_APPLIED = /already exists|duplicate|index|table/i;

export interface MigrationFile {
  /** Migration folder name, or file name for the legacy flat format. */
  version: string;
  file: string;
}

export interface MigrationRunResult {
  /** Migrations whose SQL ran and were recorded. */
  applied: string[];
  /** Migrations recorded without running because the database already had them. */
  baselined: string[];
}

export function resolveMigrationsDir(configured = process.env[MIGRATIONS_DIR_ENV]): string {
  const override = configured?.trim();
  if (override) return path.resolve(override);
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "migrations");
}

export function listMigrations(directory = resolveMigrationsDir()): MigrationFile[] {
  const entries = readdirSync(directory, { withFileTypes: true });

  // Current drizzle-kit layout: one folder per migration with migration.sql.
  const folders = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
    .map((version) => ({ version, file: path.join(directory, version, "migration.sql") }));

  // Legacy flat layout: *.sql directly under the migrations folder.
  const flat = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right))
    .map((file) => ({ version: file, file: path.join(directory, file) }));

  return [...folders, ...flat];
}

function tableExists(targetDb: Database.Database, name: string): boolean {
  const row = targetDb
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name);
  return Boolean(row);
}

function ensureTrackingTable(targetDb: Database.Database): void {
  targetDb.exec(
    `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
       version TEXT PRIMARY KEY NOT NULL,
       applied_at TEXT NOT NULL
     )`,
  );
}

function appliedVersions(targetDb: Database.Database): Set<string> {
  const rows = targetDb.prepare(`SELECT version FROM ${MIGRATIONS_TABLE}`).all() as {
    version: string;
  }[];
  return new Set(rows.map((row) => row.version));
}

/**
 * A database created before tracking existed already contains every shipped
 * migration (it was built by applying all of them at once), so they are
 * recorded as applied without being executed again.
 */
function baselineLegacyDatabase(
  targetDb: Database.Database,
  migrations: MigrationFile[],
): string[] {
  if (tableExists(targetDb, MIGRATIONS_TABLE)) return [];

  ensureTrackingTable(targetDb);
  if (!tableExists(targetDb, "faculties")) return [];

  const insert = targetDb.prepare(
    `INSERT OR IGNORE INTO ${MIGRATIONS_TABLE} (version, applied_at) VALUES (?, ?)`,
  );
  const appliedAt = new Date().toISOString();
  targetDb.transaction(() => {
    for (const migration of migrations) insert.run(migration.version, appliedAt);
  })();

  return migrations.map((migration) => migration.version);
}

function applyMigration(targetDb: Database.Database, migration: MigrationFile): void {
  const sql = readFileSync(migration.file, "utf8");
  const record = targetDb.prepare(
    `INSERT INTO ${MIGRATIONS_TABLE} (version, applied_at) VALUES (?, ?)`,
  );

  targetDb.transaction(() => {
    try {
      targetDb.exec(sql);
    } catch (error) {
      if (!(error instanceof Error) || !ALREADY_APPLIED.test(error.message)) {
        throw error;
      }
    }
    record.run(migration.version, new Date().toISOString());
  })();
}

/**
 * Applies every migration that is not recorded yet. Safe to run on every boot:
 * once a version is recorded it is skipped, so repeated deploys are no-ops.
 */
export function applyDrizzleMigrations(
  targetDb: Database.Database,
  options: { migrationsDir?: string } = {},
): MigrationRunResult {
  const migrations = listMigrations(options.migrationsDir);
  const baselined = baselineLegacyDatabase(targetDb, migrations);
  const done = appliedVersions(targetDb);
  const applied: string[] = [];

  for (const migration of migrations) {
    if (done.has(migration.version)) continue;
    applyMigration(targetDb, migration);
    applied.push(migration.version);
  }

  return { applied, baselined };
}
