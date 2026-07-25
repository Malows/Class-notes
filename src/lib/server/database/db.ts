import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { DATABASE_NAME } from "$env/static/private";

import { createSchema } from "./schema";
import { insertSeed } from "./seed";
import { applyDrizzleMigrations } from "./migrate";
import * as schema from "./schema.drizzle";

const isTest = !!(typeof process !== "undefined" && process.env.VITEST);
const dbPath = isTest ? ":memory:" : DATABASE_NAME || "class-notes.db";

export interface DatabaseInitializationOptions {
  isTest?: boolean;
  shouldSeed?: boolean;
}

export function withTransaction<T>(targetDb: Database.Database, operation: () => T): T {
  const transaction = targetDb.transaction(operation);
  return transaction();
}

export function initializeDatabase(
  targetDb: Database.Database,
  options: DatabaseInitializationOptions = {},
): { initialized: boolean; initializedWithMigrations?: boolean } {
  const { isTest: forceTestMode = false, shouldSeed = true } = options;
  const isRuntimeTest = forceTestMode || isTest;

  targetDb.pragma("foreign_keys = ON");

  if (!isRuntimeTest) {
    targetDb.pragma("journal_mode = WAL");
  }

  const tableCheck = targetDb
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='faculties'")
    .get();

  if (!tableCheck) {
    let initializedWithMigrations = false;

    try {
      applyDrizzleMigrations(targetDb);
      initializedWithMigrations = true;
    } catch {
      createSchema(targetDb);
    }

    if (shouldSeed) {
      insertSeed(targetDb);
    }

    return { initialized: true, initializedWithMigrations };
  }

  return { initialized: false };
}

const db = new Database(dbPath, { verbose: console.log });
export const drizzleDb = drizzle({ client: db, schema });
const isDev = Boolean(
  process.env.NODE_ENV === "development" ||
  (typeof import.meta !== "undefined" && import.meta.env?.DEV),
);

if (isDev || isTest) {
  initializeDatabase(db, { isTest, shouldSeed: true });
}

// Example function to get all faculties (will be moved to repository)
export function getAllFaculties() {
  const stmt = db.prepare("SELECT id, name FROM faculties WHERE deletedAt IS NULL");
  return stmt.all();
}

export default db;
