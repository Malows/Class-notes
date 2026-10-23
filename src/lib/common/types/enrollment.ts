export interface Person {
  id: number;
  name: string;
  legajo: string | null;
}

export interface Enrollment {
  id: number;
  person_id: number;
  subject_period_id: number;
  commission_id: number | null;
}

export interface EnrollmentWithPerson extends Enrollment {
  name: string;
  legajo: string | null;
}

export interface EnrollmentInput {
  name: string;
  legajo?: string | null;
  person_id?: number;
}

export interface EnrollmentRegistrationReport {
  created: number;
  reused: number;
  enrollments: EnrollmentWithPerson[];
}

export interface PersonRegistryRow {
  id: number;
  name: string;
  legajo: string | null;
  enrollment_count: number;
  last_subject_name: string | null;
  last_period_year: number | null;
  last_period_semester: number | null;
}

export interface PersonRegistryPage {
  items: PersonRegistryRow[];
  total: number;
  limit: number;
  offset: number;
}

export interface PersonCursada {
  id: number;
  subject_period_id: number;
  commission_id: number | null;
  subject_name: string;
  subject_slug: string;
  period_year: number;
  period_semester: number;
  commission_name: string | null;
  commission_slug: string | null;
  faculty_slug: string;
  faculty_name: string;
}

export interface PersonDetail {
  person: Person;
  enrollments: PersonCursada[];
}
