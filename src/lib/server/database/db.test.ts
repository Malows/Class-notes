import { describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { initializeDatabase, withTransaction } from "./db";

describe("database initialization", () => {
  it("creates schema and seed data from migrations on a fresh database", () => {
    const sqlite = new Database(":memory:");

    const result = initializeDatabase(sqlite, { isTest: true, shouldSeed: true });

    expect(result.initialized).toBe(true);
    expect(result.initializedWithMigrations).toBe(true);
    expect(sqlite.prepare("SELECT COUNT(*) as count FROM faculties").get()).toEqual({ count: 3 });
    expect(sqlite.prepare("SELECT COUNT(*) as count FROM students").get()).toEqual({ count: 32 });
  });

  it("creates the expected foreign key relationships from migrations", () => {
    const sqlite = new Database(":memory:");

    initializeDatabase(sqlite, { isTest: true, shouldSeed: false });

    const deliveriesForeignKeys = sqlite.prepare("PRAGMA foreign_key_list(deliveries)").all();
    const subjectsForeignKeys = sqlite.prepare("PRAGMA foreign_key_list(subjects)").all();

    expect(deliveriesForeignKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "assignments", from: "assignment_id", to: "id" }),
        expect.objectContaining({ table: "students", from: "student_id", to: "id" }),
      ]),
    );
    expect(subjectsForeignKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "faculties", from: "faculty_id", to: "id" }),
      ]),
    );
  });

  it("rolls back a transaction when a step fails", () => {
    const sqlite = new Database(":memory:");

    initializeDatabase(sqlite, { isTest: true, shouldSeed: false });

    expect(() =>
      withTransaction(sqlite, () => {
        sqlite.prepare("INSERT INTO faculties (name) VALUES (?)").run("Nueva Facultad");
        throw new Error("boom");
      }),
    ).toThrow("boom");

    expect(sqlite.prepare("SELECT COUNT(*) as count FROM faculties").get()).toEqual({ count: 0 });
  });
});
