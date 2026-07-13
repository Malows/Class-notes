import type { MetadataContextPayload, Period } from "$lib/common";

import db from "../db";

export interface PeriodRepository {
  getAll(subjectID?: number): Period[];
  create(subject_id: number, year: number, semester: number): Period;
  update(id: number, year: number, semester: number): Period;
  delete(id: number): void;
  getActiveMetadata(now: Date): MetadataContextPayload;
}

class PeriodRepositoryImpl implements PeriodRepository {
  getAll(subjectID?: number): Period[] {
    let query = `
      SELECT p.id, p.year, p.semester, sp.subject_id, s.name AS subject_name
      FROM periods p
      LEFT JOIN subject_periods sp ON sp.period_id = p.id AND sp.deletedAt IS NULL
      LEFT JOIN subjects s ON s.id = sp.subject_id AND s.deletedAt IS NULL
      WHERE p.deletedAt IS NULL
    `;
    const params: number[] = [];
    if (subjectID) {
      query += " AND sp.subject_id = ?";
      params.push(subjectID);
    }
    query += " ORDER BY p.year DESC, p.semester DESC, p.id DESC";
    const stmt = db.prepare(query);
    return stmt.all(params) as Period[];
  }

  create(subject_id: number, year: number, semester: number): Period {
    const existingPeriod = db
      .prepare(
        `
        SELECT p.id
        FROM periods p
        JOIN subject_periods sp ON sp.period_id = p.id AND sp.deletedAt IS NULL
        WHERE p.year = ? AND p.semester = ? AND sp.subject_id = ? AND p.deletedAt IS NULL
      `,
      )
      .get(year, semester, subject_id) as { id: number } | undefined;
    if (existingPeriod) {
      throw new Error("Period already exists for this subject");
    }

    const insertPeriod = db.prepare(
      "INSERT INTO periods (year, semester) VALUES (?, ?) RETURNING id, year, semester",
    );
    const newPeriod = insertPeriod.get(year, semester) as Period;

    const insertLink = db.prepare(
      "INSERT INTO subject_periods (subject_id, period_id) VALUES (?, ?) RETURNING id, subject_id, period_id",
    );
    insertLink.get(subject_id, newPeriod.id);

    const subjectStmt = db.prepare("SELECT name FROM subjects WHERE id = ?");
    newPeriod.subject_id = subject_id;
    newPeriod.subject_name = (subjectStmt.get(subject_id) as any).name;
    return newPeriod;
  }

  update(id: number, year: number, semester: number): Period {
    const checkStmt = db.prepare(
      `
      SELECT p.id
      FROM periods p
      JOIN subject_periods sp ON sp.period_id = p.id AND sp.deletedAt IS NULL
      WHERE p.year = ? AND p.semester = ? AND sp.subject_id = (SELECT sp2.subject_id FROM subject_periods sp2 WHERE sp2.period_id = ? AND sp2.deletedAt IS NULL LIMIT 1)
        AND p.id != ? AND p.deletedAt IS NULL
      `,
    );
    if (checkStmt.get(year, semester, id, id)) {
      throw new Error("Period already exists for this subject");
    }

    const stmt = db.prepare(
      "UPDATE periods SET year = ?, semester = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL RETURNING id, year, semester",
    );
    const updatedPeriod = stmt.get(year, semester, id) as Period;
    if (updatedPeriod) {
      const subjectLink = db
        .prepare(
          "SELECT subject_id FROM subject_periods WHERE period_id = ? AND deletedAt IS NULL ORDER BY id LIMIT 1",
        )
        .get(id) as { subject_id: number } | undefined;
      if (subjectLink) {
        const subjectStmt = db.prepare("SELECT name FROM subjects WHERE id = ?");
        updatedPeriod.subject_id = subjectLink.subject_id;
        updatedPeriod.subject_name = (subjectStmt.get(subjectLink.subject_id) as any).name;
      }
    }
    return updatedPeriod;
  }

  delete(id: number): void {
    const stmt = db.prepare("UPDATE periods SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(id);
  }

  getActiveMetadata(now: Date): MetadataContextPayload {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const rows = db
      .prepare(
        `
      SELECT p.id, p.year, p.semester, s.id AS subject_id, s.name AS subject_name, s.faculty_id
      FROM periods p
      JOIN subject_periods sp ON sp.period_id = p.id AND sp.deletedAt IS NULL
      JOIN subjects s ON sp.subject_id = s.id AND s.deletedAt IS NULL
      WHERE p.deletedAt IS NULL
        AND p.year = ?
        AND ((p.semester = 1 AND ? <= 1) OR (p.semester = 2 AND ? <= 2))
      ORDER BY s.name ASC
    `,
      )
      .all(currentYear, currentMonth, currentMonth) as Array<{
      id: number;
      year: number;
      semester: number;
      subject_id: number;
      subject_name: string;
      faculty_id: number;
    }>;

    if (rows.length === 0) {
      return { periodData: null, subjects: [] };
    }

    const [first] = rows;
    const term = first.semester === 1 ? "Cuatrimestre I" : "Cuatrimestre II";
    const subjectItems = rows.map((row) => ({
      id: String(row.subject_id),
      name: row.subject_name,
      href: `/faculties/${row.faculty_id}/subjects/${row.subject_id}/periods`,
    }));

    return {
      periodData: {
        year: first.year,
        term,
      },
      subjects: subjectItems,
    };
  }
}

export const periodRepository: PeriodRepository = new PeriodRepositoryImpl();
