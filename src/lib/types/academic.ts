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
export interface Assignment {
  id: number;
  period_id: number;
  title: string;
  subtitle?: string;
}
