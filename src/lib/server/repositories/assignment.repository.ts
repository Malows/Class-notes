import type { Assignment } from "$lib/types";

import db from "../db";

export interface AssignmentRepository {
  getAll(periodID?: number): Assignment[];
  create(periodID: number, title: string): Assignment;
  update(id: number, title: string): Assignment;
  copy(sourcePeriodID: number, targetPeriodID: number): void;
  delete(id: number): void;
}

class AssignmentRepositoryImpl implements AssignmentRepository {
  getAll(periodID?: number): Assignment[] {
    let query = "SELECT id, period_id, title, subtitle FROM assignments WHERE deletedAt IS NULL";
    const params: number[] = [];
    if (periodID) {
      query += " AND period_id = ?";
      params.push(periodID);
    }
    const stmt = db.prepare(query);
    return stmt.all(params) as Assignment[];
  }

  create(periodID: number, title: string): Assignment {
    const stmt = db.prepare(
      "INSERT INTO assignments (period_id, title) VALUES (?, ?) RETURNING id, period_id, title, subtitle",
    );
    return stmt.get(periodID, title) as Assignment;
  }

  update(id: number, title: string): Assignment {
    const stmt = db.prepare(
      "UPDATE assignments SET title = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL RETURNING id, period_id, title, subtitle",
    );
    return stmt.get(title, id) as Assignment;
  }

  copy(sourcePeriodID: number, targetPeriodID: number): void {
    const selectStmt = db.prepare(
      "SELECT title, subtitle FROM assignments WHERE period_id = ? AND deletedAt IS NULL",
    );
    const assignmentsToCopy = selectStmt.all(sourcePeriodID) as { title: string; subtitle?: string | null }[];

    const insertStmt = db.prepare(
      "INSERT INTO assignments (period_id, title, subtitle) VALUES (?, ?, ?)",
    );
    const insertMany = db.transaction((assignmentsToInsert) => {
      for (const assignment of assignmentsToInsert) {
        insertStmt.run(targetPeriodID, assignment.title, assignment.subtitle ?? null);
      }
    });
    insertMany(assignmentsToCopy);
  }

  delete(id: number): void {
    const stmt = db.prepare("UPDATE assignments SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(id);
  }
}

export const assignmentRepository: AssignmentRepository = new AssignmentRepositoryImpl();
