export enum DeliveryWorkflowStatus {
  NOT_DICTATED = "NOT_DICTATED",
  WAITING_FOR_STUDENTS = "WAITING_FOR_STUDENTS",
  WAITING_FOR_CORRECTION = "WAITING_FOR_CORRECTION",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface Student {
  id: number;
  commission_id: number;
  name: string;
  external_id: string;
}
export interface Delivery {
  assignment_id: number;
  student_id: number;
  grade: number;
  ai_level: number;
  comments: string;
  workflow_status: DeliveryWorkflowStatus;
}
