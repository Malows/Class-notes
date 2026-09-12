import type { Subject } from "$lib/common/types/academic";

export interface FacultySubjectGroup {
  facultyId: number;
  facultyName: string;
  subjects: Subject[];
}

export function groupSubjectsByFaculty(subjects: Subject[]): FacultySubjectGroup[] {
  const grouped = new Map<number, FacultySubjectGroup>();

  for (const subject of subjects) {
    const existing = grouped.get(subject.faculty_id);
    if (existing) {
      existing.subjects.push(subject);
      existing.subjects.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      grouped.set(subject.faculty_id, {
        facultyId: subject.faculty_id,
        facultyName: subject.faculty_name,
        subjects: [subject],
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => a.facultyName.localeCompare(b.facultyName));
}
