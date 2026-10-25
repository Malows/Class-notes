import { attendanceService } from "$lib/client/services/attendance.service";
import type { AttendanceGrid, AttendanceRecord } from "$lib/common/types/attendance";
import { AttendanceStatus } from "$lib/common/types/attendance";

export class AttendanceStore {
  grid = $state<AttendanceGrid | null>(null);
  loaded = $state(false);

  constructor(private service = attendanceService) {}

  async loadCommission(commissionId: number) {
    this.grid = await this.service.getGridByCommission(commissionId);
    this.loaded = true;
  }

  async loadCursada(subjectPeriodId: number) {
    this.grid = await this.service.getGridByCursada(subjectPeriodId);
    this.loaded = true;
  }

  async mark(assignmentId: number, enrollmentId: number, status: AttendanceStatus) {
    const record = await this.service.mark(assignmentId, enrollmentId, status);
    this.applyRecord({
      assignment_id: record.assignment_id,
      enrollment_id: record.enrollment_id,
      status: record.status,
      recorded_on: record.recorded_on,
      commission_id: record.commission_id,
    });
    return record;
  }

  async unmark(assignmentId: number, enrollmentId: number) {
    await this.service.unmark(assignmentId, enrollmentId);
    this.applyRecord({
      assignment_id: assignmentId,
      enrollment_id: enrollmentId,
      status: null,
      recorded_on: null,
      commission_id: null,
    });
  }

  async bulkMarkPresent(assignmentId: number) {
    const enrollmentIds = (this.grid?.rows ?? []).map((row) => row.enrollment_id);

    if (enrollmentIds.length === 0) {
      return [];
    }

    const records = await this.service.bulk(
      assignmentId,
      enrollmentIds.map((enrollment_id) => ({
        enrollment_id,
        status: AttendanceStatus.PRESENT,
      })),
    );

    for (const record of records) {
      this.applyRecord({
        assignment_id: record.assignment_id,
        enrollment_id: record.enrollment_id,
        status: record.status,
        recorded_on: record.recorded_on,
        commission_id: record.commission_id,
      });
    }

    return records;
  }

  applyRecord(record: Pick<AttendanceRecord, "assignment_id" | "enrollment_id"> & {
    status: AttendanceStatus | null;
    recorded_on: string | null;
    commission_id: number | null;
  }) {
    if (!this.grid) {
      return;
    }

    const row = this.grid.rows.find((item) => item.enrollment_id === record.enrollment_id);
    if (!row) {
      return;
    }

    const cell = row.cells.find((item) => item.assignment_id === record.assignment_id);
    if (!cell) {
      return;
    }

    cell.status = record.status;
    cell.recorded_on = record.recorded_on;
    cell.commission_id = record.commission_id;

    row.present_count = row.cells.filter((item) => item.status === AttendanceStatus.PRESENT).length;
    row.taken_count = row.cells.filter((item) => item.status !== null).length;

    this.grid.columns = this.grid.assignments.map((assignment) => {
      const cells = this.grid!.rows
        .map((item) => item.cells.find((entry) => entry.assignment_id === assignment.id))
        .filter((entry) => entry !== undefined);

      return {
        assignment_id: assignment.id,
        present_count: cells.filter((item) => item.status === AttendanceStatus.PRESENT).length,
        taken_count: cells.filter((item) => item.status !== null).length,
      };
    });
  }

  reset() {
    this.grid = null;
    this.loaded = false;
  }
}

export const attendanceStore = new AttendanceStore();
