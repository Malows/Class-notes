import { and, eq, isNull, sql, type SQL } from "drizzle-orm";
import type { Assignment } from "$lib/common/types/academic";

import db, { drizzleDb, withTransaction } from "../database/db";
import { assignments, deliveries, enrollments } from "../database/schema";

export interface AssignmentRepository {
  getAll(subjectPeriodId?: number): Assignment[];
  create(
    subjectPeriodId: number,
    title: string,
    subtitle?: string,
    workflow_status?: string,
  ): Assignment;
  update(id: number, title: string, subtitle?: string, workflow_status?: string): Assignment;
  updateStatus(id: number, status: string): void;
  copy(sourceSubjectPeriodId: number, targetSubjectPeriodId: number): void;
  delete(id: number): void;
}

const assignmentColumns = {
  id: assignments.id,
  subject_period_id: assignments.subjectPeriodId,
  title: assignments.title,
  subtitle: assignments.subtitle,
  workflow_status: assignments.workflowStatus,
};

class AssignmentRepositoryImpl implements AssignmentRepository {
  getAll(subjectPeriodId?: number): Assignment[] {
    const conditions = [isNull(assignments.deletedAt)];
    if (subjectPeriodId) {
      conditions.push(eq(assignments.subjectPeriodId, subjectPeriodId));
    }

    return drizzleDb
      .select(assignmentColumns)
      .from(assignments)
      .where(and(...conditions))
      .all() as Assignment[];
  }

  private enrollmentIdsForCursada(subjectPeriodId: number): number[] {
    return drizzleDb
      .select({ id: enrollments.id })
      .from(enrollments)
      .where(
        and(eq(enrollments.subjectPeriodId, subjectPeriodId), isNull(enrollments.deletedAt)),
      )
      .all()
      .map((row) => row.id);
  }

  create(
    subjectPeriodId: number,
    title: string,
    subtitle?: string,
    workflow_status: string = "NOT_DICTATED",
  ): Assignment {
    return withTransaction(db, () => {
      const assignment = drizzleDb
        .insert(assignments)
        .values({
          subjectPeriodId,
          title,
          subtitle: subtitle ?? null,
          workflowStatus: workflow_status,
        })
        .returning(assignmentColumns)
        .get() as Assignment;

      for (const enrollmentId of this.enrollmentIdsForCursada(subjectPeriodId)) {
        drizzleDb
          .insert(deliveries)
          .values({
            assignmentId: assignment.id,
            enrollmentId,
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
        .returning(assignmentColumns)
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

  copy(sourceSubjectPeriodId: number, targetSubjectPeriodId: number): void {
    const assignmentsToCopy = drizzleDb
      .select({
        title: assignments.title,
        subtitle: assignments.subtitle,
        workflowStatus: assignments.workflowStatus,
      })
      .from(assignments)
      .where(
        and(
          eq(assignments.subjectPeriodId, sourceSubjectPeriodId),
          isNull(assignments.deletedAt),
        ),
      )
      .all() as Array<{ title: string; subtitle?: string | null; workflowStatus?: string | null }>;

    const targetEnrollmentIds = this.enrollmentIdsForCursada(targetSubjectPeriodId);

    withTransaction(db, () => {
      for (const assignment of assignmentsToCopy) {
        const inserted = drizzleDb
          .insert(assignments)
          .values({
            subjectPeriodId: targetSubjectPeriodId,
            title: assignment.title,
            subtitle: assignment.subtitle ?? null,
            workflowStatus: assignment.workflowStatus ?? "NOT_DICTATED",
          })
          .returning({ id: assignments.id, workflowStatus: assignments.workflowStatus })
          .get() as { id: number; workflowStatus: string };

        for (const enrollmentId of targetEnrollmentIds) {
          drizzleDb
            .insert(deliveries)
            .values({
              assignmentId: inserted.id,
              enrollmentId,
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
