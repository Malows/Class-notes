import type { Assignment } from "./academic";
import type { EnrollmentGridRowDTO } from "./dto";

export interface GlobalStats {
  totalStudents: number;
  totalSubjects: number;
  approvalRate: number;
  totalDeliveries: number;
}
export interface PendingSummary {
  commission_id: number;
  commission_name: string;
  commission_slug: string;
  subject_id: number;
  subject_name: string;
  subject_slug: string;
  faculty_id: number;
  faculty_slug: string;
  period_id: number;
  period_year: number;
  period_semester: number;
  pending_count: number;
}
export interface OverviewData {
  assignments: Assignment[];
  grid: EnrollmentGridRowDTO[];
}
