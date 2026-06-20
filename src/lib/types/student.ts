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

export enum OverviewDeliveryStatus {
  APPROVED = "approved",
  REJECTED = "rejected",
  PENDING_CORRECTION = "pending_correction",
  PENDING_DELIVERY = "pending_delivery",
}

export function getOverviewDeliveryStatus(delivery: Delivery): OverviewDeliveryStatus {
  switch (delivery.workflow_status) {
    case DeliveryWorkflowStatus.APPROVED:
      return OverviewDeliveryStatus.APPROVED;
    case DeliveryWorkflowStatus.REJECTED:
      return OverviewDeliveryStatus.REJECTED;
    case DeliveryWorkflowStatus.WAITING_FOR_CORRECTION:
      return OverviewDeliveryStatus.PENDING_CORRECTION;
    case DeliveryWorkflowStatus.WAITING_FOR_STUDENTS:
    case DeliveryWorkflowStatus.NOT_DICTATED:
    default:
      return OverviewDeliveryStatus.PENDING_DELIVERY;
  }
}
