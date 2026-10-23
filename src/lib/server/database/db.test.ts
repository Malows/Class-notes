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
    expect(sqlite.prepare("SELECT COUNT(*) as count FROM persons").get()).toEqual({ count: 32 });
    expect(sqlite.prepare("SELECT COUNT(*) as count FROM enrollments").get()).toEqual({
      count: 32,
    });
  });

  it("seeds one enrollment per person, in the cursada of its commission, keeping every legajo", () => {
    const sqlite = new Database(":memory:");

    initializeDatabase(sqlite, { isTest: true, shouldSeed: true });

    expect(sqlite.prepare("SELECT COUNT(DISTINCT person_id) as count FROM enrollments").get()).toEqual(
      { count: 32 },
    );
    expect(
      sqlite.prepare("SELECT COUNT(*) as count FROM persons WHERE legajo IS NOT NULL").get(),
    ).toEqual({ count: 32 });
    expect(sqlite.prepare("SELECT COUNT(DISTINCT legajo) as count FROM persons").get()).toEqual({
      count: 32,
    });
    expect(
      sqlite
        .prepare(
          `SELECT COUNT(*) as count
             FROM enrollments e
             JOIN commissions c ON c.id = e.commission_id
             JOIN subject_periods sp ON sp.id = e.subject_period_id
            WHERE c.subject_id <> sp.subject_id OR c.period_id <> sp.period_id`,
        )
        .get(),
    ).toEqual({ count: 0 });
  });

  it("keeps every seeded delivery inside the cursada of its assignment", () => {
    const sqlite = new Database(":memory:");

    initializeDatabase(sqlite, { isTest: true, shouldSeed: true });

    expect(
      sqlite
        .prepare(
          `SELECT COUNT(*) as count
             FROM deliveries d
             JOIN assignments a ON a.id = d.assignment_id
             JOIN enrollments e ON e.id = d.enrollment_id
            WHERE a.subject_period_id <> e.subject_period_id`,
        )
        .get(),
    ).toEqual({ count: 0 });
    expect(sqlite.prepare("SELECT COUNT(*) as count FROM deliveries").get()).toEqual({ count: 28 });
  });

  it("creates the expected foreign key relationships from migrations", () => {
    const sqlite = new Database(":memory:");

    initializeDatabase(sqlite, { isTest: true, shouldSeed: false });

    const deliveriesForeignKeys = sqlite.prepare("PRAGMA foreign_key_list(deliveries)").all();
    const assignmentsForeignKeys = sqlite.prepare("PRAGMA foreign_key_list(assignments)").all();
    const enrollmentsForeignKeys = sqlite.prepare("PRAGMA foreign_key_list(enrollments)").all();
    const subjectsForeignKeys = sqlite.prepare("PRAGMA foreign_key_list(subjects)").all();

    expect(deliveriesForeignKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "assignments", from: "assignment_id", to: "id" }),
        expect.objectContaining({ table: "enrollments", from: "enrollment_id", to: "id" }),
      ]),
    );
    expect(assignmentsForeignKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "subject_periods", from: "subject_period_id", to: "id" }),
      ]),
    );
    expect(enrollmentsForeignKeys).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ table: "persons", from: "person_id", to: "id" }),
        expect.objectContaining({ table: "commissions", from: "commission_id", to: "id" }),
        expect.objectContaining({
          table: "subject_periods",
          from: "subject_period_id",
          to: "id",
        }),
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
        sqlite
          .prepare("INSERT INTO faculties (name, slug) VALUES (?, ?)")
          .run("Nueva Facultad", "nueva-facultad");
        throw new Error("boom");
      }),
    ).toThrow("boom");

    expect(sqlite.prepare("SELECT COUNT(*) as count FROM faculties").get()).toEqual({ count: 0 });
  });
});
