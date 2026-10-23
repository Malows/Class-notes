import type { Assignment } from "./academic";
import type { CursadaRosterCommission } from "./enrollment";

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
}

export interface AttendanceRecord {
  assignment_id: number;
  enrollment_id: number;
  subject_period_id: number;
  commission_id: number | null;
  status: AttendanceStatus;
  recorded_on: string;
}

export interface AttendanceCell {
  assignment_id: number;
  enrollment_id: number;
  status: AttendanceStatus | null;
  recorded_on: string | null;
  commission_id: number | null;
}

export interface AttendanceGridRow {
  enrollment_id: number;
  person_id: number;
  name: string;
  legajo: string | null;
  commission_id: number | null;
  commission_name: string | null;
  commission_slug: string | null;
  is_guest: boolean;
  present_count: number;
  taken_count: number;
  cells: AttendanceCell[];
}

export interface AttendanceGridColumn {
  assignment_id: number;
  present_count: number;
  taken_count: number;
}

export interface AttendanceGridScopeSubject {
  id: number;
  name: string;
  slug: string;
  faculty_slug: string;
}

export interface AttendanceGridScopePeriod {
  id: number;
  year: number;
  semester: number;
}

export interface AttendanceGrid {
  scope: "commission" | "cursada";
  subject: AttendanceGridScopeSubject;
  period: AttendanceGridScopePeriod;
  commission: CursadaRosterCommission | null;
  commissions: CursadaRosterCommission[];
  assignments: Assignment[];
  rows: AttendanceGridRow[];
  columns: AttendanceGridColumn[];
}
