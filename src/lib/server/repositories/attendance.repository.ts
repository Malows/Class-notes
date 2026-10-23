import { and, eq, isNull, sql } from "drizzle-orm";
import type { AttendanceRecord, AttendanceStatus } from "$lib/common/types/attendance";

import db, { drizzleDb, withTransaction } from "../database/db";
import { attendances } from "../database/schema";

export interface AttendanceUpsertInput {
  assignmentId: number;
  enrollmentId: number;
  subjectPeriodId: number;
  commissionId: number | null;
  status: AttendanceStatus;
  recordedOn: string;
}

export interface AttendanceRepository {
  getOne(assignmentId: number, enrollmentId: number): AttendanceRecord | null;
  getByCursada(subjectPeriodId: number): AttendanceRecord[];
  upsert(input: AttendanceUpsertInput): AttendanceRecord;
  unmark(assignmentId: number, enrollmentId: number): void;
  bulkUpsert(inputs: AttendanceUpsertInput[]): AttendanceRecord[];
}

const attendanceColumns = {
  assignment_id: attendances.assignmentId,
  enrollment_id: attendances.enrollmentId,
  subject_period_id: attendances.subjectPeriodId,
  commission_id: attendances.commissionId,
  status: attendances.status,
  recorded_on: attendances.recordedOn,
};

class AttendanceRepositoryImpl implements AttendanceRepository {
  getOne(assignmentId: number, enrollmentId: number): AttendanceRecord | null {
    return (
      (drizzleDb
        .select(attendanceColumns)
        .from(attendances)
        .where(
          and(
            eq(attendances.assignmentId, assignmentId),
            eq(attendances.enrollmentId, enrollmentId),
            isNull(attendances.deletedAt),
          ),
        )
        .get() as AttendanceRecord | undefined) ?? null
    );
  }

  getByCursada(subjectPeriodId: number): AttendanceRecord[] {
    return drizzleDb
      .select(attendanceColumns)
      .from(attendances)
      .where(
        and(
          eq(attendances.subjectPeriodId, subjectPeriodId),
          isNull(attendances.deletedAt),
        ),
      )
      .all() as AttendanceRecord[];
  }

  upsert(input: AttendanceUpsertInput): AttendanceRecord {
    return withTransaction(db, () => {
      const existing = drizzleDb
        .select({ assignmentId: attendances.assignmentId })
        .from(attendances)
        .where(
          and(
            eq(attendances.assignmentId, input.assignmentId),
            eq(attendances.enrollmentId, input.enrollmentId),
          ),
        )
        .get() as { assignmentId: number } | undefined;

      if (existing) {
        drizzleDb
          .update(attendances)
          .set({
            status: input.status,
            recordedOn: input.recordedOn,
            commissionId: input.commissionId,
            subjectPeriodId: input.subjectPeriodId,
            updatedAt: sql`CURRENT_TIMESTAMP`,
            deletedAt: null,
          })
          .where(
            and(
              eq(attendances.assignmentId, input.assignmentId),
              eq(attendances.enrollmentId, input.enrollmentId),
            ),
          )
          .run();
      } else {
        drizzleDb
          .insert(attendances)
          .values({
            assignmentId: input.assignmentId,
            enrollmentId: input.enrollmentId,
            subjectPeriodId: input.subjectPeriodId,
            commissionId: input.commissionId,
            status: input.status,
            recordedOn: input.recordedOn,
          })
          .run();
      }

      return this.getOne(input.assignmentId, input.enrollmentId) as AttendanceRecord;
    });
  }

  unmark(assignmentId: number, enrollmentId: number): void {
    drizzleDb
      .update(attendances)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(
        and(
          eq(attendances.assignmentId, assignmentId),
          eq(attendances.enrollmentId, enrollmentId),
        ),
      )
      .run();
  }

  bulkUpsert(inputs: AttendanceUpsertInput[]): AttendanceRecord[] {
    return withTransaction(db, () => inputs.map((input) => this.upsert(input)));
  }
}

export const attendanceRepository: AttendanceRepository = new AttendanceRepositoryImpl();
