import type { Period } from "$lib/types";

import db from "../db";

export interface PeriodRepository {
  getAll(subjectID?: number): Period[];
  create(subject_id: number, year: number, semester: number): Period;
  update(id: number, year: number, semester: number): Period;
  delete(id: number): void;
}

class PeriodRepositoryImpl implements PeriodRepository {
  getAll(subjectID?: number): Period[] {
    let query =
      "SELECT p.id, p.subject_id, p.year, p.semester, s.name AS subject_name FROM periods p JOIN subjects s ON p.subject_id = s.id WHERE p.deletedAt IS NULL AND s.deletedAt IS NULL";
    const params: number[] = [];
    if (subjectID) {
      query += " AND p.subject_id = ?";
      params.push(subjectID);
    }
    const stmt = db.prepare(query);
    return stmt.all(params) as Period[];
  }

  create(subject_id: number, year: number, semester: number): Period {
    const checkStmt = db.prepare(
      "SELECT id FROM periods WHERE subject_id = ? AND year = ? AND semester = ? AND deletedAt IS NULL",
    );
    if (checkStmt.get(subject_id, year, semester)) {
      throw new Error("Period already exists for this subject");
    }

    const stmt = db.prepare(
      "INSERT INTO periods (subject_id, year, semester) VALUES (?, ?, ?) RETURNING id, subject_id, year, semester",
    );
    const newPeriod = stmt.get(subject_id, year, semester) as Period;
    // Fetch subject_name for the returned object
    const subjectStmt = db.prepare("SELECT name FROM subjects WHERE id = ?");
    newPeriod.subject_name = (subjectStmt.get(subject_id) as any).name;
    return newPeriod;
  }

  update(id: number, year: number, semester: number): Period {
    const checkStmt = db.prepare(
      "SELECT id FROM periods WHERE subject_id = (SELECT subject_id FROM periods WHERE id = ?) AND year = ? AND semester = ? AND id != ? AND deletedAt IS NULL",
    );
    if (checkStmt.get(id, year, semester, id)) {
      throw new Error("Period already exists for this subject");
    }

    const stmt = db.prepare(
      "UPDATE periods SET year = ?, semester = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL RETURNING id, subject_id, year, semester",
    );
    const updatedPeriod = stmt.get(year, semester, id) as Period;
    if (updatedPeriod) {
      const subjectStmt = db.prepare("SELECT name FROM subjects WHERE id = ?");
      updatedPeriod.subject_name = (subjectStmt.get(updatedPeriod.subject_id) as any).name;
    }
    return updatedPeriod;
  }

  delete(id: number): void {
    const stmt = db.prepare("UPDATE periods SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(id);
  }
}

export const periodRepository: PeriodRepository = new PeriodRepositoryImpl();
