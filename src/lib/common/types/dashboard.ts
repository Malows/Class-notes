import type { Assignment } from "./academic";
import type { EnrollmentGridRowDTO } from "./dto";

export interface GlobalStats {
  totalStudents: number;
  totalSubjects: number;
  approvalRate: number;
  totalDeliveries: number;
}
export interface PendingSummary {
  id: number;
  title: string;
}
export interface OverviewData {
  assignments: Assignment[];
  grid: EnrollmentGridRowDTO[];
}
