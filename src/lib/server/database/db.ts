import Database from "better-sqlite3";
import { DATABASE_NAME } from "$env/static/private";

import { createSchema } from "./schema";
import { insertSeed } from "./seed";

const isTest = typeof process !== "undefined" && process.env.VITEST;
const dbPath = isTest ? ":memory:" : DATABASE_NAME || "class-notes.db";

const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys and WAL mode for better concurrency
db.pragma("foreign_keys = ON");

if (!isTest) {
  db.pragma("journal_mode = WAL");
}

const isDev =
  process.env.NODE_ENV === "development" ||
  (typeof import.meta !== "undefined" && import.meta.env?.DEV);

if (isDev || isTest) {
  // Check if the database is empty (does not have a faculties table)
  const tableCheck = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='faculties'")
    .get();

  if (!tableCheck) {
    console.log(`Database '${dbPath}' is empty. Creating schema and inserting seed data...`);
    createSchema(db);
    insertSeed(db);
    console.log("Database initialized successfully!");
  }
}

// Example function to get all faculties (will be moved to repository)
export function getAllFaculties() {
  const stmt = db.prepare("SELECT id, name FROM faculties WHERE deletedAt IS NULL");
  return stmt.all();
}

export default db;
