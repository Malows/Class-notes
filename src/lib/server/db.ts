import Database from "better-sqlite3";

const db = new Database("class-notes.db", { verbose: console.log });

// Enable WAL mode for better concurrency
db.pragma("journal_mode = WAL");

// Example function to get all faculties (will be moved to repository)
export function getAllFaculties() {
  const stmt = db.prepare("SELECT id, name FROM faculties");
  return stmt.all();
}

export default db;
