import { and, eq, isNull, sql, type SQL } from "drizzle-orm";
import type { Assignment } from "$lib/common/types/academic";

import db, { drizzleDb, withTransaction } from "../database/db";
import { assignments, commissions, deliveries, students } from "../database/schema.drizzle";

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
    const conditions = [isNull(assignments.deletedAt)];
    if (periodID) {
      conditions.push(eq(assignments.periodId, periodID));
    }

    return drizzleDb
      .select({
        id: assignments.id,
        period_id: assignments.periodId,
        title: assignments.title,
        subtitle: assignments.subtitle,
        workflow_status: assignments.workflowStatus,
      })
      .from(assignments)
      .where(and(...conditions))
      .all() as Assignment[];
  }

  create(
    periodID: number,
    title: string,
    subtitle?: string,
    workflow_status: string = "NOT_DICTATED",
  ): Assignment {
    return withTransaction(db, () => {
      const assignment = drizzleDb
        .insert(assignments)
        .values({
          periodId: periodID,
          title,
          subtitle: subtitle ?? null,
          workflowStatus: workflow_status,
        })
        .returning({
          id: assignments.id,
          period_id: assignments.periodId,
          title: assignments.title,
          subtitle: assignments.subtitle,
          workflow_status: assignments.workflowStatus,
        })
        .get() as Assignment;

      const targetStudents = drizzleDb
        .select({ id: students.id })
        .from(students)
        .innerJoin(commissions, eq(students.commissionId, commissions.id))
        .where(
          and(
            eq(commissions.periodId, periodID),
            isNull(students.deletedAt),
            isNull(commissions.deletedAt),
          ),
        )
        .all() as { id: number }[];

      for (const student of targetStudents) {
        drizzleDb
          .insert(deliveries)
          .values({
            assignmentId: assignment.id,
            studentId: student.id,
            workflowStatus: workflow_status,
          })
          .run();
      }
      return assignment;
    });
  }

  update(id: number, title: string, subtitle?: string, workflow_status?: string): Assignment {
    return withTransaction(db, () => {
      const updates: Record<string, string | number | SQL<unknown> | null> = {};
      if (title !== undefined) {
        updates.title = title;
      }
      if (subtitle !== undefined) {
        updates.subtitle = subtitle;
      }
      if (workflow_status !== undefined) {
        updates.workflowStatus = workflow_status;
      }
      updates.updatedAt = sql`CURRENT_TIMESTAMP`;

      return drizzleDb
        .update(assignments)
        .set(updates as any)
        .where(and(eq(assignments.id, id), isNull(assignments.deletedAt)))
        .returning({
          id: assignments.id,
          period_id: assignments.periodId,
          title: assignments.title,
          subtitle: assignments.subtitle,
          workflow_status: assignments.workflowStatus,
        })
        .get() as Assignment;
    });
  }

  updateStatus(id: number, status: string): void {
    withTransaction(db, () => {
      drizzleDb
        .update(assignments)
        .set({ workflowStatus: status, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(assignments.id, id), isNull(assignments.deletedAt)))
        .run();

      drizzleDb
        .update(deliveries)
        .set({ workflowStatus: status, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(deliveries.assignmentId, id), isNull(deliveries.deletedAt)))
        .run();
    });
  }

  copy(sourcePeriodID: number, targetPeriodID: number): void {
    const assignmentsToCopy = drizzleDb
      .select({
        title: assignments.title,
        subtitle: assignments.subtitle,
        workflowStatus: assignments.workflowStatus,
      })
      .from(assignments)
      .where(and(eq(assignments.periodId, sourcePeriodID), isNull(assignments.deletedAt)))
      .all() as Array<{ title: string; subtitle?: string | null; workflowStatus?: string | null }>;

    const targetStudents = drizzleDb
      .select({ id: students.id })
      .from(students)
      .innerJoin(commissions, eq(students.commissionId, commissions.id))
      .where(
        and(
          eq(commissions.periodId, targetPeriodID),
          isNull(students.deletedAt),
          isNull(commissions.deletedAt),
        ),
      )
      .all() as { id: number }[];

    withTransaction(db, () => {
      for (const assignment of assignmentsToCopy) {
        const inserted = drizzleDb
          .insert(assignments)
          .values({
            periodId: targetPeriodID,
            title: assignment.title,
            subtitle: assignment.subtitle ?? null,
            workflowStatus: assignment.workflowStatus ?? "NOT_DICTATED",
          })
          .returning({ id: assignments.id, workflowStatus: assignments.workflowStatus })
          .get() as { id: number; workflowStatus: string };

        for (const student of targetStudents) {
          drizzleDb
            .insert(deliveries)
            .values({
              assignmentId: inserted.id,
              studentId: student.id,
              workflowStatus: inserted.workflowStatus,
            })
            .run();
        }
      }
    });
  }

  delete(id: number): void {
    drizzleDb
      .update(assignments)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(assignments.id, id))
      .run();
  }
}

export const assignmentRepository: AssignmentRepository = new AssignmentRepositoryImpl();
