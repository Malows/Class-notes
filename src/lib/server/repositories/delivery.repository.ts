import { and, eq, isNull, sql } from "drizzle-orm";
import type { Assignment, Delivery, OverviewData, StudentGridRowDTO } from "$lib/common";
import { DeliveryWorkflowStatus } from "$lib/common";

import db, { drizzleDb, withTransaction } from "../database/db";
import {
  assignments,
  commissions,
  deliveries,
  faculties,
  periods,
  students,
  subjectPeriods,
  subjects,
} from "../database/schema";

export interface DeliveryRepository {
  getOne(assignmentID: number, studentID: number): Delivery | null;
  getAllByCommission(commissionID: number): Delivery[];
  save(delivery: Delivery): void;
  getCommissionOverviewData(commissionID: number): OverviewData;
  getPeriodOverviewData(periodID: number): OverviewData;
  getPendingSummary(): any[];
  getGlobalStats(): any;
}

class DeliveryRepositoryImpl implements DeliveryRepository {
  getOne(assignmentID: number, studentID: number): Delivery | null {
    return drizzleDb
      .select({
        assignment_id: deliveries.assignmentId,
        student_id: deliveries.studentId,
        workflow_status: deliveries.workflowStatus,
        grade: deliveries.grade,
        ai_level: deliveries.aiLevel,
        comments: deliveries.comments,
      })
      .from(deliveries)
      .where(
        and(
          eq(deliveries.assignmentId, assignmentID),
          eq(deliveries.studentId, studentID),
          isNull(deliveries.deletedAt),
        ),
      )
      .get() as Delivery | null;
  }

  getAllByCommission(commissionID: number): Delivery[] {
    return drizzleDb
      .select({
        assignment_id: deliveries.assignmentId,
        student_id: deliveries.studentId,
        workflow_status: deliveries.workflowStatus,
        grade: deliveries.grade,
        ai_level: deliveries.aiLevel,
        comments: deliveries.comments,
      })
      .from(deliveries)
      .innerJoin(students, eq(deliveries.studentId, students.id))
      .where(
        and(
          eq(students.commissionId, commissionID),
          isNull(deliveries.deletedAt),
          isNull(students.deletedAt),
        ),
      )
      .all() as Delivery[];
  }

  save(delivery: Delivery): void {
    const workflowStatus = delivery.workflow_status ?? DeliveryWorkflowStatus.NOT_DICTATED;

    withTransaction(db, () => {
      const existing = drizzleDb
        .select({ assignmentId: deliveries.assignmentId })
        .from(deliveries)
        .where(
          and(
            eq(deliveries.assignmentId, delivery.assignment_id),
            eq(deliveries.studentId, delivery.student_id),
          ),
        )
        .get() as { assignmentId: number } | undefined;

      if (existing) {
        drizzleDb
          .update(deliveries)
          .set({
            workflowStatus,
            grade: delivery.grade,
            aiLevel: delivery.ai_level,
            comments: delivery.comments,
            updatedAt: sql`CURRENT_TIMESTAMP`,
            deletedAt: null,
          })
          .where(
            and(
              eq(deliveries.assignmentId, delivery.assignment_id),
              eq(deliveries.studentId, delivery.student_id),
            ),
          )
          .run();
      } else {
        drizzleDb
          .insert(deliveries)
          .values({
            assignmentId: delivery.assignment_id,
            studentId: delivery.student_id,
            workflowStatus,
            grade: delivery.grade,
            aiLevel: delivery.ai_level,
            comments: delivery.comments,
          })
          .run();
      }
    });
  }

  getCommissionOverviewData(commissionID: number): OverviewData {
    const assignmentsRows = drizzleDb
      .select({ id: assignments.id, title: assignments.title, subtitle: assignments.subtitle })
      .from(assignments)
      .where(
        and(
          isNull(assignments.deletedAt),
          eq(
            assignments.periodId,
            sql`(SELECT period_id FROM commissions WHERE id = ${commissionID})`,
          ),
        ),
      )
      .orderBy(assignments.id)
      .all() as Assignment[];

    const studentsRows = drizzleDb
      .select({ id: students.id, name: students.name, commission_id: students.commissionId })
      .from(students)
      .where(and(eq(students.commissionId, commissionID), isNull(students.deletedAt)))
      .orderBy(students.name)
      .all() as Array<{ id: number; name: string; commission_id: number }>;

    const deliveriesRows = drizzleDb
      .select({
        assignment_id: deliveries.assignmentId,
        student_id: deliveries.studentId,
        workflow_status: deliveries.workflowStatus,
        grade: deliveries.grade,
        ai_level: deliveries.aiLevel,
        comments: deliveries.comments,
      })
      .from(deliveries)
      .where(
        and(
          isNull(deliveries.deletedAt),
          sql`${deliveries.studentId} IN (SELECT id FROM students WHERE commission_id = ${commissionID} AND deletedAt IS NULL)`,
        ),
      )
      .all() as Delivery[];

    const grid: StudentGridRowDTO[] = studentsRows.map((s) => {
      const studentDeliveries = assignmentsRows.map((a) => {
        const delivery = deliveriesRows.find(
          (d) => d.student_id === s.id && d.assignment_id === a.id,
        );
        return (
          delivery || {
            assignment_id: a.id,
            student_id: s.id,
            workflow_status: DeliveryWorkflowStatus.NOT_DICTATED,
            grade: 0,
            ai_level: 0,
            comments: "",
          }
        );
      });
      return {
        id: s.id,
        name: s.name,
        commission_id: s.commission_id,
        deliveries: studentDeliveries,
      };
    });

    return { assignments: assignmentsRows, grid };
  }

  getPeriodOverviewData(periodID: number): OverviewData {
    const assignmentsRows = drizzleDb
      .select({ id: assignments.id, title: assignments.title, subtitle: assignments.subtitle })
      .from(assignments)
      .where(and(isNull(assignments.deletedAt), eq(assignments.periodId, periodID)))
      .orderBy(assignments.id)
      .all() as Assignment[];

    const studentsRows = drizzleDb
      .select({ id: students.id, name: students.name, commission_id: students.commissionId })
      .from(students)
      .innerJoin(commissions, eq(students.commissionId, commissions.id))
      .where(
        and(
          eq(commissions.periodId, periodID),
          isNull(students.deletedAt),
          isNull(commissions.deletedAt),
        ),
      )
      .orderBy(students.name)
      .all() as Array<{ id: number; name: string; commission_id: number }>;

    const deliveriesRows = drizzleDb
      .select({
        assignment_id: deliveries.assignmentId,
        student_id: deliveries.studentId,
        workflow_status: deliveries.workflowStatus,
        grade: deliveries.grade,
        ai_level: deliveries.aiLevel,
        comments: deliveries.comments,
      })
      .from(deliveries)
      .where(
        and(
          isNull(deliveries.deletedAt),
          sql`${deliveries.studentId} IN (SELECT id FROM students WHERE deletedAt IS NULL AND commission_id IN (SELECT id FROM commissions WHERE period_id = ${periodID}))`,
        ),
      )
      .all() as Delivery[];

    const grid: StudentGridRowDTO[] = studentsRows.map((s) => {
      const studentDeliveries = assignmentsRows.map((a) => {
        const delivery = deliveriesRows.find(
          (d) => d.student_id === s.id && d.assignment_id === a.id,
        );
        return (
          delivery || {
            assignment_id: a.id,
            student_id: s.id,
            workflow_status: DeliveryWorkflowStatus.NOT_DICTATED,
            grade: 0,
            ai_level: 0,
            comments: "",
          }
        );
      });
      return {
        id: s.id,
        name: s.name,
        commission_id: s.commission_id,
        deliveries: studentDeliveries,
      };
    });

    return { assignments: assignmentsRows, grid };
  }

  getPendingSummary(): any[] {
    const pendingCount = sql<number>`COUNT(${students.id}) - (
      SELECT COUNT(*)
      FROM deliveries d
      JOIN students s2 ON d.student_id = s2.id
      WHERE s2.commission_id = ${commissions.id}
        AND d.workflow_status NOT IN ('NOT_DICTATED', 'WAITING_FOR_STUDENTS')
        AND d.deletedAt IS NULL
    )`;

    return drizzleDb
      .select({
        commission_id: commissions.id,
        commission_name: commissions.name,
        subject_name: subjects.name,
        faculty_id: faculties.id,
        subject_id: subjects.id,
        period_id: periods.id,
        pending_count: pendingCount,
      })
      .from(commissions)
      .innerJoin(periods, eq(commissions.periodId, periods.id))
      .innerJoin(
        subjectPeriods,
        and(eq(subjectPeriods.periodId, periods.id), isNull(subjectPeriods.deletedAt)),
      )
      .innerJoin(
        subjects,
        and(eq(subjectPeriods.subjectId, subjects.id), isNull(subjects.deletedAt)),
      )
      .innerJoin(faculties, eq(subjects.facultyId, faculties.id))
      .leftJoin(
        students,
        and(eq(students.commissionId, commissions.id), isNull(students.deletedAt)),
      )
      .where(
        and(isNull(commissions.deletedAt), isNull(periods.deletedAt), isNull(subjects.deletedAt)),
      )
      .groupBy(commissions.id)
      .having(sql`${pendingCount} > 0`)
      .orderBy(sql`${pendingCount} DESC`)
      .all() as any[];
  }

  getGlobalStats(): any {
    const totalStudents = drizzleDb
      .select({ count: sql<number>`COUNT(*)` })
      .from(students)
      .where(isNull(students.deletedAt))
      .get() as { count: number };
    const totalSubjects = drizzleDb
      .select({ count: sql<number>`COUNT(*)` })
      .from(subjects)
      .where(isNull(subjects.deletedAt))
      .get() as { count: number };
    const totalDeliveries = drizzleDb
      .select({ count: sql<number>`COUNT(*)` })
      .from(deliveries)
      .where(
        and(
          isNull(deliveries.deletedAt),
          sql`${deliveries.workflowStatus} NOT IN ('NOT_DICTATED', 'WAITING_FOR_STUDENTS')`,
        ),
      )
      .get() as { count: number };
    const approvedDeliveries = drizzleDb
      .select({ count: sql<number>`COUNT(*)` })
      .from(deliveries)
      .where(and(isNull(deliveries.deletedAt), eq(deliveries.workflowStatus, "APPROVED")))
      .get() as { count: number };

    const approvalRate =
      totalDeliveries.count > 0
        ? Math.round((approvedDeliveries.count / totalDeliveries.count) * 100)
        : 0;

    return {
      totalStudents: totalStudents.count,
      totalSubjects: totalSubjects.count,
      totalDeliveries: totalDeliveries.count,
      approvalRate,
    };
  }
}

export const deliveryRepository: DeliveryRepository = new DeliveryRepositoryImpl();
