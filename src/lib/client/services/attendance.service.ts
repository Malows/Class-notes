import { apiFetch } from "$lib/client/services/api";
import type {
  AttendanceGrid,
  AttendanceRecord,
  AttendanceStatus,
} from "$lib/common/types/attendance";

export interface AttendanceBulkPayloadEntry {
  enrollment_id: number;
  status: AttendanceStatus;
}

export const attendanceService = {
  getGridByCommission: (commission_id: number) =>
    apiFetch<AttendanceGrid>(`/attendance?commission_id=${commission_id}`),
  getGridByCursada: (subject_period_id: number) =>
    apiFetch<AttendanceGrid>(`/attendance?subject_period_id=${subject_period_id}`),
  mark: (
    assignment_id: number,
    enrollment_id: number,
    status: AttendanceStatus,
    commission_id?: number | null,
  ) =>
    apiFetch<AttendanceRecord>(`/attendance/${assignment_id}/${enrollment_id}`, {
      method: "PUT",
      body: JSON.stringify({ status, commission_id: commission_id ?? null }),
    }),
  unmark: (assignment_id: number, enrollment_id: number) =>
    apiFetch<void>(`/attendance/${assignment_id}/${enrollment_id}`, {
      method: "DELETE",
    }),
  bulk: (
    assignment_id: number,
    commission_id: number | null,
    entries: AttendanceBulkPayloadEntry[],
  ) =>
    apiFetch<AttendanceRecord[]>("/attendance/bulk", {
      method: "POST",
      body: JSON.stringify({ assignment_id, commission_id, entries }),
    }),
};
