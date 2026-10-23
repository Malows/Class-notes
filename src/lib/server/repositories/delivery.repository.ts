import { and, eq, isNull, sql } from "drizzle-orm";
import type {
  Assignment,
  Delivery,
  EnrollmentGridRowDTO,
  OverviewData,
} from "$lib/common";
import { DeliveryWorkflowStatus } from "$lib/common";

import db, { drizzleDb, withTransaction } from "../database/db";
import {
  assignments,
  commissions,
  deliveries,
  enrollments,
  faculties,
  periods,
  persons,
  subjectPeriods,
  subjects,
} from "../database/schema";

export interface DeliveryRepository {
  getOne(assignmentID: number, enrollmentID: number): Delivery | null;
  getAllByCommission(commissionID: number): Delivery[];
  save(delivery: Delivery): void;
  getCommissionOverviewData(commissionID: number): OverviewData;
  getSubjectPeriodOverviewData(subjectID: number, periodID: number): OverviewData;
  getPendingSummary(): any[];
  getGlobalStats(): any;
}

const deliveryColumns = {
  assignment_id: deliveries.assignmentId,
  enrollment_id: deliveries.enrollmentId,
  workflow_status: deliveries.workflowStatus,
  grade: deliveries.grade,
  ai_level: deliveries.aiLevel,
  comments: deliveries.comments,
};

const emptyDelivery = (assignmentId: number, enrollmentId: number): Delivery => ({
  assignment_id: assignmentId,
  enrollment_id: enrollmentId,
  workflow_status: DeliveryWorkflowStatus.NOT_DICTATED,
  grade: 0,
  ai_level: 0,
  comments: "",
});

class DeliveryRepositoryImpl implements DeliveryRepository {
  getOne(assignmentID: number, enrollmentID: number): Delivery | null {
    return (
      (drizzleDb
        .select(deliveryColumns)
        .from(deliveries)
        .where(
          and(
            eq(deliveries.assignmentId, assignmentID),
            eq(deliveries.enrollmentId, enrollmentID),
            isNull(deliveries.deletedAt),
          ),
        )
        .get() as Delivery | undefined) ?? null
    );
  }

  getAllByCommission(commissionID: number): Delivery[] {
    return drizzleDb
      .select(deliveryColumns)
      .from(deliveries)
      .innerJoin(enrollments, eq(deliveries.enrollmentId, enrollments.id))
      .where(
        and(
          eq(enrollments.commissionId, commissionID),
          isNull(deliveries.deletedAt),
          isNull(enrollments.deletedAt),
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
            eq(deliveries.enrollmentId, delivery.enrollment_id),
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
              eq(deliveries.enrollmentId, delivery.enrollment_id),
            ),
          )
          .run();
      } else {
        drizzleDb
          .insert(deliveries)
          .values({
            assignmentId: delivery.assignment_id,
            enrollmentId: delivery.enrollment_id,
            workflowStatus,
            grade: delivery.grade,
            aiLevel: delivery.ai_level,
            comments: delivery.comments,
          })
          .run();
      }
    });
  }

  private assignmentsForCursada(subjectPeriodId: number): Assignment[] {
    return drizzleDb
      .select({
        id: assignments.id,
        subject_period_id: assignments.subjectPeriodId,
        title: assignments.title,
        subtitle: assignments.subtitle,
      })
      .from(assignments)
      .where(
        and(
          isNull(assignments.deletedAt),
          eq(assignments.subjectPeriodId, subjectPeriodId),
        ),
      )
      .orderBy(assignments.id)
      .all() as Assignment[];
  }

  private enrollmentRows(where: ReturnType<typeof and>) {
    return drizzleDb
      .select({
        id: enrollments.id,
        enrollment_id: enrollments.id,
        name: persons.name,
        commission_id: enrollments.commissionId,
        subject_period_id: enrollments.subjectPeriodId,
      })
      .from(enrollments)
      .innerJoin(persons, eq(enrollments.personId, persons.id))
      .where(where)
      .orderBy(persons.name)
      .all() as Array<{
      id: number;
      enrollment_id: number;
      name: string;
      commission_id: number | null;
      subject_period_id: number;
    }>;
  }

  private deliveriesForEnrollments(enrollmentIds: number[]): Delivery[] {
    if (enrollmentIds.length === 0) {
      return [];
    }

    return drizzleDb
      .select(deliveryColumns)
      .from(deliveries)
      .where(
        and(
          isNull(deliveries.deletedAt),
          sql`${deliveries.enrollmentId} IN (${sql.join(
            enrollmentIds.map((id) => sql`${id}`),
            sql`, `,
          )})`,
        ),
      )
      .all() as Delivery[];
  }

  private buildGrid(
    enrollmentRows: Array<{ id: number; name: string; commission_id: number | null }>,
    assignmentRows: Assignment[],
    deliveryRows: Delivery[],
  ): EnrollmentGridRowDTO[] {
    return enrollmentRows.map((row) => {
      const rowDeliveries = assignmentRows.map(
        (assignment) =>
          deliveryRows.find(
            (delivery) =>
              delivery.enrollment_id === row.id && delivery.assignment_id === assignment.id,
          ) ?? emptyDelivery(assignment.id, row.id),
      );

      return {
        id: row.id,
        enrollment_id: row.id,
        name: row.name,
        commission_id: row.commission_id ?? undefined,
        deliveries: rowDeliveries,
      };
    });
  }

  getCommissionOverviewData(commissionID: number): OverviewData {
    const commission = drizzleDb
      .select({ subjectPeriodId: subjectPeriods.id })
      .from(commissions)
      .innerJoin(
        subjectPeriods,
        and(
          eq(subjectPeriods.subjectId, commissions.subjectId),
          eq(subjectPeriods.periodId, commissions.periodId),
          isNull(subjectPeriods.deletedAt),
        ),
      )
      .where(and(eq(commissions.id, commissionID), isNull(commissions.deletedAt)))
      .get() as { subjectPeriodId: number } | undefined;

    if (!commission) {
      return { assignments: [], grid: [] };
    }

    const assignmentRows = this.assignmentsForCursada(commission.subjectPeriodId);
    const rows = this.enrollmentRows(
      and(
        eq(enrollments.commissionId, commissionID),
        isNull(enrollments.deletedAt),
        isNull(persons.deletedAt),
      ),
    );
    const deliveryRows = this.deliveriesForEnrollments(rows.map((row) => row.id));

    return {
      assignments: assignmentRows,
      grid: this.buildGrid(rows, assignmentRows, deliveryRows),
    };
  }

  getSubjectPeriodOverviewData(subjectID: number, periodID: number): OverviewData {
    const cursada = drizzleDb
      .select({ id: subjectPeriods.id })
      .from(subjectPeriods)
      .where(
        and(
          eq(subjectPeriods.subjectId, subjectID),
          eq(subjectPeriods.periodId, periodID),
          isNull(subjectPeriods.deletedAt),
        ),
      )
      .get() as { id: number } | undefined;

    if (!cursada) {
      return { assignments: [], grid: [] };
    }

    const assignmentRows = this.assignmentsForCursada(cursada.id);
    const rows = this.enrollmentRows(
      and(
        eq(enrollments.subjectPeriodId, cursada.id),
        isNull(enrollments.deletedAt),
        isNull(persons.deletedAt),
      ),
    );
    const deliveryRows = this.deliveriesForEnrollments(rows.map((row) => row.id));

    return {
      assignments: assignmentRows,
      grid: this.buildGrid(rows, assignmentRows, deliveryRows),
    };
  }

  getPendingSummary(): any[] {
    const pendingCount = sql<number>`COUNT(${enrollments.id}) - (
      SELECT COUNT(*)
      FROM deliveries d
      JOIN enrollments e2 ON d.enrollment_id = e2.id
      WHERE e2.commission_id = ${commissions.id}
        AND d.workflow_status NOT IN ('NOT_DICTATED', 'WAITING_FOR_STUDENTS')
        AND d.deletedAt IS NULL
    )`;

    return drizzleDb
      .select({
        commission_id: commissions.id,
        commission_name: commissions.name,
        commission_slug: commissions.slug,
        subject_name: subjects.name,
        subject_slug: subjects.slug,
        faculty_id: faculties.id,
        faculty_slug: faculties.slug,
        subject_id: subjects.id,
        period_id: periods.id,
        period_year: periods.year,
        period_semester: periods.semester,
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
        enrollments,
        and(eq(enrollments.commissionId, commissions.id), isNull(enrollments.deletedAt)),
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
      .from(enrollments)
      .where(isNull(enrollments.deletedAt))
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
