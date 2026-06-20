export interface Faculty {
  id: number;
  name: string;
}
export interface Subject {
  id: number;
  name: string;
  faculty_id: number;
  faculty_name: string;
}
export interface Period {
  id: number;
  subject_id: number;
  year: number;
  semester: number;
}
export interface Commission {
  id: number;
  period_id: number;
  name: string;
  student_count: number;
}
export enum AssignmentWorkflowStatus {
  NOT_DICTATED = "NOT_DICTATED",
  WAITING_FOR_STUDENTS = "WAITING_FOR_STUDENTS",
  WAITING_FOR_CORRECTION = "WAITING_FOR_CORRECTION",
}

export interface Assignment {
  id: number;
  period_id: number;
  title: string;
  subtitle?: string;
  workflow_status?: AssignmentWorkflowStatus;
}
