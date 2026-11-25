import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { building } from "$app/environment";
import { env } from "$env/dynamic/private";

import { resolveDatabasePath, shouldSeedDemoData } from "./config";
import { applyDrizzleMigrations, MIGRATIONS_TABLE } from "./migrate";
import { insertSeed } from "./seed";
import * as schema from "./schema";
import { relations } from "./relations";

const isTest = !!(typeof process !== "undefined" && process.env.VITEST);

/**
 * Build-time constant: `true` only for a `vite build` bundle. A production
 * image therefore cannot be tricked into development behavior at runtime.
 */
export const isProductionBuild = Boolean(import.meta.env.PROD);

export interface DatabaseInitializationOptions {
  isTest?: boolean;
  shouldSeed?: boolean;
  migrationsDir?: string;
}

export interface DatabaseInitializationResult {
  initialized: boolean;
  initializedWithMigrations?: boolean;
}

export function withTransaction<T>(targetDb: Database.Database, operation: () => T): T {
  const transaction = targetDb.transaction(operation);
  return transaction();
}

/**
 * Opens the SQLite file with the pragmas the app expects. Verbose SQL logging
 * is opt-in (`DB_VERBOSE=true`) because it writes every statement.
 */
export function openDatabase(
  databasePath: string,
  options: { verbose?: boolean } = {},
): Database.Database {
  const targetDb = new Database(
    databasePath,
    options.verbose ? { verbose: console.log } : undefined,
  );
  targetDb.pragma("foreign_keys = ON");
  if (databasePath !== ":memory:") {
    targetDb.pragma("journal_mode = WAL");
  }
  return targetDb;
}

/**
 * Applies pending migrations (and optionally the demo fixtures). Used by tests,
 * the dev server and the standalone seed script; the production image runs
 * `build/migrate.js` as its own phase and never passes `shouldSeed`.
 */
export function initializeDatabase(
  targetDb: Database.Database,
  options: DatabaseInitializationOptions = {},
): DatabaseInitializationResult {
  const { shouldSeed = false, migrationsDir } = options;

  const result = applyDrizzleMigrations(targetDb, { migrationsDir });

  if (shouldSeed) {
    insertSeed(targetDb);
  }

  return {
    initialized: result.applied.length > 0 || result.baselined.length > 0,
    initializedWithMigrations: result.applied.length > 0,
  };
}

function runtimeEnv(): Record<string, string | undefined> {
  return { ...process.env, ...env };
}

function tableExists(targetDb: Database.Database, name: string): boolean {
  const row = targetDb
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name);
  return Boolean(row);
}

/**
 * True when nothing has ever initialized this file: neither tracked migrations
 * nor the legacy `faculties` marker table are present.
 */
export function isUninitializedDatabase(targetDb: Database.Database): boolean {
  return !tableExists(targetDb, MIGRATIONS_TABLE) && !tableExists(targetDb, "faculties");
}

function createDatabase(): Database.Database {
  const dbPath = resolveDatabasePath({
    env: runtimeEnv(),
    isTest,
    isProduction: isProductionBuild,
  });

  const targetDb = openDatabase(dbPath, { verbose: runtimeEnv().DB_VERBOSE === "true" });

  if (isTest || import.meta.env.DEV) {
    // Demo fixtures only hydrate a database that is being created now; an
    // existing dev database is never polluted on restart.
    initializeDatabase(targetDb, {
      shouldSeed:
        isUninitializedDatabase(targetDb) &&
        shouldSeedDemoData({ env: runtimeEnv(), isProductionBuild }),
    });
  } else if (!tableExists(targetDb, MIGRATIONS_TABLE)) {
    targetDb.close();
    throw new Error(
      "Database schema is not initialized. Run the migration phase first (node build/migrate.js) against DATABASE_PATH.",
    );
  }

  return targetDb;
}

function createDrizzleClient(client: Database.Database) {
  return drizzle({ client, schema, relations } as any);
}

/**
 * `building` is `true` only while SvelteKit analyses the server bundle. The
 * connection is opened eagerly at runtime (so a missing DATABASE_PATH or an
 * unmigrated file fails at startup) but never during the build.
 */
const db: Database.Database = building
  ? (undefined as unknown as Database.Database)
  : createDatabase();

export type DrizzleClient = ReturnType<typeof createDrizzleClient>;

export const drizzleDb: DrizzleClient = building
  ? (undefined as unknown as DrizzleClient)
  : createDrizzleClient(db);

// Example function to get all faculties (will be moved to repository)
export function getAllFaculties() {
  const stmt = db.prepare("SELECT id, name FROM faculties WHERE deletedAt IS NULL");
  return stmt.all();
}

export default db;
