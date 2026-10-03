import { afterEach, describe, expect, it } from "vitest";

import { periodSubjectRepository } from "./period-subject.repository";
import db from "../database/db";

describe("periodSubjectRepository", () => {
  const createdLinks: Array<{ periodId: number; subjectId: number }> = [];

  afterEach(() => {
    for (const link of createdLinks) {
      db.prepare("DELETE FROM subject_periods WHERE period_id = ? AND subject_id = ?").run(
        link.periodId,
        link.subjectId,
      );
    }
    createdLinks.length = 0;
  });

  it("returns the subjects linked to a period", () => {
    db.prepare("INSERT INTO faculties (id, name) VALUES (?, ?)").run(101, "Test Faculty");
    db.prepare("INSERT INTO subjects (id, faculty_id, name) VALUES (?, ?, ?)").run(101, 101, "Álgebra Lineal");
    db.prepare("INSERT INTO periods (id, year, semester) VALUES (?, ?, ?)").run(9, 2089, 1);
    db.prepare("INSERT INTO subject_periods (subject_id, period_id) VALUES (?, ?)").run(101, 9);
    createdLinks.push({ periodId: 9, subjectId: 101 });

    const subjects = periodSubjectRepository.getAll(9);

    expect(subjects).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 101, name: "Álgebra Lineal" })]),
    );
  });

  it("syncs the association to exactly the provided subject ids", () => {
    db.prepare("INSERT INTO faculties (id, name) VALUES (?, ?)").run(102, "Test Faculty");
    db.prepare("INSERT INTO subjects (id, faculty_id, name) VALUES (?, ?, ?)").run(102, 102, "Álgebra Lineal");
    db.prepare("INSERT INTO subjects (id, faculty_id, name) VALUES (?, ?, ?)").run(103, 102, "Análisis Matemático");
    db.prepare("INSERT INTO subjects (id, faculty_id, name) VALUES (?, ?, ?)").run(104, 102, "Física");
    db.prepare("INSERT INTO periods (id, year, semester) VALUES (?, ?, ?)").run(10, 2026, 2);
    db.prepare("INSERT INTO subject_periods (subject_id, period_id) VALUES (?, ?)").run(102, 10);
    createdLinks.push({ periodId: 10, subjectId: 102 });

    const synced = periodSubjectRepository.sync(10, [103, 104]);

    const rows = db
      .prepare("SELECT subject_id FROM subject_periods WHERE period_id = ? AND deletedAt IS NULL")
      .all(10) as Array<{ subject_id: number }>;

    expect(synced.map((subject) => subject.id)).toEqual(expect.arrayContaining([103, 104]));
    expect(rows.map((row) => row.subject_id)).toEqual([103, 104]);
  });
});
