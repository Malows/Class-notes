import type {
  AttendanceCell,
  AttendanceGrid,
  AttendanceGridColumn,
  AttendanceGridRow,
} from "$lib/common/types/attendance";
import { AttendanceStatus } from "$lib/common/types/attendance";
import type { Assignment } from "$lib/common/types/academic";
import type { CursadaRosterStudent, EnrollmentWithPerson } from "$lib/common/types/enrollment";

import { assignmentRepository } from "../repositories/assignment.repository";
import { attendanceRepository } from "../repositories/attendance.repository";
import { commissionRepository } from "../repositories/commission.repository";
import { CrossCursadaError, enrollmentRepository } from "../repositories/enrollment.repository";
import { periodSubjectService } from "./period-subject.service";

export class AttendanceTargetNotFoundError extends Error {
  constructor(what: string) {
    super(`${what} not found`);
    this.name = "AttendanceTargetNotFoundError";
  }
}

export interface AttendanceBulkEntry {
  enrollment_id: number;
  status: AttendanceStatus;
}

export const todayLocalDate = (now: Date = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const cellKey = (assignmentId: number, enrollmentId: number) => `${assignmentId}:${enrollmentId}`;

const buildRows = (
  students: CursadaRosterStudent[],
  assignments: Assignment[],
  records: Map<string, { status: AttendanceStatus; recorded_on: string; commission_id: number | null }>,
): AttendanceGridRow[] =>
  students.map((student) => {
    const cells: AttendanceCell[] = assignments.map((assignment) => {
      const record = records.get(cellKey(assignment.id, student.enrollment_id));
      return {
        assignment_id: assignment.id,
        enrollment_id: student.enrollment_id,
        status: record?.status ?? null,
        recorded_on: record?.recorded_on ?? null,
        commission_id: record?.commission_id ?? null,
      };
    });

    return {
      enrollment_id: student.enrollment_id,
      person_id: student.person_id,
      name: student.name,
      legajo: student.legajo,
      commission_id: student.commission_id,
      commission_name: student.commission_name,
      commission_slug: student.commission_slug,
      present_count: cells.filter((cell) => cell.status === AttendanceStatus.PRESENT).length,
      taken_count: cells.filter((cell) => cell.status !== null).length,
      cells,
    };
  });

const buildColumns = (rows: AttendanceGridRow[], assignments: Assignment[]): AttendanceGridColumn[] =>
  assignments.map((assignment) => {
    const cells = rows
      .map((row) => row.cells.find((cell) => cell.assignment_id === assignment.id))
      .filter((cell): cell is AttendanceCell => Boolean(cell));

    return {
      assignment_id: assignment.id,
      present_count: cells.filter((cell) => cell.status === AttendanceStatus.PRESENT).length,
      taken_count: cells.filter((cell) => cell.status !== null).length,
    };
  });

const resolveTarget = (assignmentId: number, enrollmentId: number) => {
  const assignment = assignmentRepository.findById(assignmentId);
  if (!assignment) {
    throw new AttendanceTargetNotFoundError("Assignment");
  }

  const enrollment = enrollmentRepository.findById(enrollmentId);
  if (!enrollment) {
    throw new AttendanceTargetNotFoundError("Enrollment");
  }

  if (enrollment.subject_period_id !== assignment.subject_period_id) {
    throw new CrossCursadaError();
  }

  return { assignment, enrollment };
};

export const attendanceService = {
  getGridByCommission(commissionId: number): AttendanceGrid | null {
    const scope = commissionRepository.findScope(commissionId);
    if (!scope) {
      return null;
    }

    const subjectPeriodId = periodSubjectService.findCursadaId(scope.subject_id, scope.period_id);
    if (subjectPeriodId === null) {
      return null;
    }

    const roster = enrollmentRepository.getCursadaRoster(subjectPeriodId);
    if (!roster) {
      return null;
    }

    const assignments = assignmentRepository.getAll(subjectPeriodId);
    const recordsRows = attendanceRepository.getByCursada(subjectPeriodId);
    const records = new Map(
      recordsRows.map((record) => [
        cellKey(record.assignment_id, record.enrollment_id),
        {
          status: record.status,
          recorded_on: record.recorded_on,
          commission_id: record.commission_id,
        },
      ]),
    );

    const students = roster.students.filter(
      (student) => student.commission_id === commissionId,
    );

    const rows = buildRows(students, assignments, records);

    return {
      scope: "commission",
      subject: roster.subject,
      period: roster.period,
      commission: { id: scope.id, name: scope.name, slug: scope.slug },
      commissions: roster.commissions,
      assignments,
      rows,
      columns: buildColumns(rows, assignments),
    };
  },

  getGridByCursada(subjectPeriodId: number): AttendanceGrid | null {
    const roster = enrollmentRepository.getCursadaRoster(subjectPeriodId);
    if (!roster) {
      return null;
    }

    const assignments = assignmentRepository.getAll(subjectPeriodId);
    const records = new Map(
      attendanceRepository
        .getByCursada(subjectPeriodId)
        .map((record) => [
          cellKey(record.assignment_id, record.enrollment_id),
          {
            status: record.status,
            recorded_on: record.recorded_on,
            commission_id: record.commission_id,
          },
        ]),
    );

    const rows = buildRows(roster.students, assignments, records);

    return {
      scope: "cursada",
      subject: roster.subject,
      period: roster.period,
      commission: null,
      commissions: roster.commissions,
      assignments,
      rows,
      columns: buildColumns(rows, assignments),
    };
  },

  getOne(assignmentId: number, enrollmentId: number) {
    return attendanceRepository.getOne(assignmentId, enrollmentId);
  },

  mark(assignmentId: number, enrollmentId: number, status: AttendanceStatus) {
    const { assignment, enrollment } = resolveTarget(assignmentId, enrollmentId);

    return attendanceRepository.upsert({
      assignmentId,
      enrollmentId,
      subjectPeriodId: assignment.subject_period_id,
      commissionId: enrollment.commission_id ?? null,
      status,
      recordedOn: todayLocalDate(),
    });
  },

  unmark(assignmentId: number, enrollmentId: number): void {
    attendanceRepository.unmark(assignmentId, enrollmentId);
  },

  bulk(assignmentId: number, entries: AttendanceBulkEntry[]) {
    const assignment = assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new AttendanceTargetNotFoundError("Assignment");
    }

    const recordedOn = todayLocalDate();

    return attendanceRepository.bulkUpsert(
      entries.map((entry) => {
        const enrollment: EnrollmentWithPerson | null = enrollmentRepository.findById(
          entry.enrollment_id,
        );
        if (!enrollment) {
          throw new AttendanceTargetNotFoundError("Enrollment");
        }
        if (enrollment.subject_period_id !== assignment.subject_period_id) {
          throw new CrossCursadaError();
        }

        return {
          assignmentId,
          enrollmentId: entry.enrollment_id,
          subjectPeriodId: assignment.subject_period_id,
          commissionId: enrollment.commission_id ?? null,
          status: entry.status,
          recordedOn,
        };
      }),
    );
  },
};
