import type { Assignment } from "$lib/types";

import db from "../db";

export interface AssignmentRepository {
  getAll(periodID?: number): Assignment[];
  create(periodID: number, title: string, subtitle?: string, workflow_status?: string): Assignment;
  update(id: number, title: string, subtitle?: string, workflow_status?: string): Assignment;
  updateStatus(id: number, status: string): void;
  copy(sourcePeriodID: number, targetPeriodID: number): void;
  delete(id: number): void;
}

class AssignmentRepositoryImpl implements AssignmentRepository {
  getAll(periodID?: number): Assignment[] {
    let query =
      "SELECT id, period_id, title, subtitle, workflow_status FROM assignments WHERE deletedAt IS NULL";
    const params: number[] = [];
    if (periodID) {
      query += " AND period_id = ?";
      params.push(periodID);
    }
    const stmt = db.prepare(query);
    return stmt.all(params) as Assignment[];
  }

  create(
    periodID: number,
    title: string,
    subtitle?: string,
    workflow_status: string = "NOT_DICTATED",
  ): Assignment {
    const stmt = db.prepare(
      "INSERT INTO assignments (period_id, title, subtitle, workflow_status) VALUES (?, ?, ?, ?) RETURNING id, period_id, title, subtitle, workflow_status",
    );
    const assignment = stmt.get(periodID, title, subtitle ?? null, workflow_status) as Assignment;
    // Auto-create deliveries for all students in the period's commissions
    const studentStmt = db.prepare(
      "SELECT id FROM students WHERE commission_id IN (SELECT id FROM commissions WHERE period_id = ?) AND deletedAt IS NULL",
    );
    const students = studentStmt.all(periodID) as { id: number }[];
    const deliveryStmt = db.prepare(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status) VALUES (?, ?, ?) ON CONFLICT(assignment_id, student_id) DO NOTHING",
    );
    const insertMany = db.transaction((assignId: number, studentIds: { id: number }[]) => {
      for (const s of studentIds) {
        deliveryStmt.run(assignId, s.id, workflow_status);
      }
    });
    insertMany(assignment.id, students);
    return assignment;
  }

  update(id: number, title: string, subtitle?: string, workflow_status?: string): Assignment {
    const fields = [];
    const params: any[] = [];
    if (title !== undefined) {
      fields.push("title = ?");
      params.push(title);
    }
    if (subtitle !== undefined) {
      fields.push("subtitle = ?");
      params.push(subtitle);
    }
    if (workflow_status !== undefined) {
      fields.push("workflow_status = ?");
      params.push(workflow_status);
    }
    const setClause = fields.length
      ? fields.join(", ") + ", updatedAt = CURRENT_TIMESTAMP"
      : "updatedAt = CURRENT_TIMESTAMP";
    const stmt = db.prepare(
      `UPDATE assignments SET ${setClause} WHERE id = ? AND deletedAt IS NULL RETURNING id, period_id, title, subtitle, workflow_status`,
    );
    params.push(id);
    return stmt.get(...params) as Assignment;
  }

  updateStatus(id: number, status: string): void {
    const updateAssignmentStmt = db.prepare(
      "UPDATE assignments SET workflow_status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL",
    );
    const updateDeliveriesStmt = db.prepare(
      "UPDATE deliveries SET workflow_status = ?, updatedAt = CURRENT_TIMESTAMP WHERE assignment_id = ? AND deletedAt IS NULL",
    );
    const transaction = db.transaction((idParam: number, statusParam: string) => {
      updateAssignmentStmt.run(statusParam, idParam);
      updateDeliveriesStmt.run(statusParam, idParam);
    });
    transaction(id, status);
  }

  copy(sourcePeriodID: number, targetPeriodID: number): void {
    const selectStmt = db.prepare(
      "SELECT title, subtitle, workflow_status FROM assignments WHERE period_id = ? AND deletedAt IS NULL",
    );
    const assignmentsToCopy = selectStmt.all(sourcePeriodID) as {
      title: string;
      subtitle?: string | null;
      workflow_status?: string | null;
    }[];

    const insertStmt = db.prepare(
      "INSERT INTO assignments (period_id, title, subtitle, workflow_status) VALUES (?, ?, ?, ?) RETURNING id, workflow_status",
    );

    // Retrieve students in target period commissions
    const studentStmt = db.prepare(
      "SELECT id FROM students WHERE commission_id IN (SELECT id FROM commissions WHERE period_id = ?) AND deletedAt IS NULL",
    );
    const students = studentStmt.all(targetPeriodID) as { id: number }[];

    const deliveryStmt = db.prepare(
      "INSERT INTO deliveries (assignment_id, student_id, workflow_status) VALUES (?, ?, ?) ON CONFLICT(assignment_id, student_id) DO NOTHING",
    );

    const copyTransaction = db.transaction(
      (assignments: typeof assignmentsToCopy, studentIds: typeof students) => {
        for (const assignment of assignments) {
          const inserted = insertStmt.get(
            targetPeriodID,
            assignment.title,
            assignment.subtitle ?? null,
            assignment.workflow_status ?? "NOT_DICTATED",
          ) as { id: number; workflow_status: string };

          for (const student of studentIds) {
            deliveryStmt.run(inserted.id, student.id, inserted.workflow_status);
          }
        }
      },
    );

    copyTransaction(assignmentsToCopy, students);
  }

  delete(id: number): void {
    const stmt = db.prepare("UPDATE assignments SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(id);
  }
}

export const assignmentRepository: AssignmentRepository = new AssignmentRepositoryImpl();
