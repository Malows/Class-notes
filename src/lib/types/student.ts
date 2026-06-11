export interface Student {
  id: number;
  commission_id: number;
  name: string;
  external_id: string;
}
export interface Delivery {
  assignment_id: number;
  student_id: number;
  is_delivered: boolean;
  is_approved: boolean;
  grade: number;
  ai_level: number;
  comments: string;
}
