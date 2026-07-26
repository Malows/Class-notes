import { and, eq, isNull, sql } from "drizzle-orm";
import type { Subject } from "$lib/common/types/academic";

import db, { drizzleDb, withTransaction } from "../database/db";
import { faculties, subjects } from "../database/schema";

export interface SubjectRepository {
  getAll(): Subject[];
  create(faculty_id: number, name: string): Subject;
  update(id: number, name: string): Subject;
  delete(id: number): void;
}

class SubjectRepositoryImpl implements SubjectRepository {
  getAll(): Subject[] {
    return drizzleDb
      .select({
        id: subjects.id,
        faculty_id: subjects.facultyId,
        name: subjects.name,
        faculty_name: faculties.name,
      })
      .from(subjects)
      .innerJoin(faculties, eq(subjects.facultyId, faculties.id))
      .where(and(isNull(subjects.deletedAt), isNull(faculties.deletedAt)))
      .all() as Subject[];
  }

  create(faculty_id: number, name: string): Subject {
    return withTransaction(db, () => {
      const newSubject = drizzleDb
        .insert(subjects)
        .values({ facultyId: faculty_id, name })
        .returning({ id: subjects.id, faculty_id: subjects.facultyId, name: subjects.name })
        .get() as Subject;

      const facultyName = drizzleDb
        .select({ name: faculties.name })
        .from(faculties)
        .where(eq(faculties.id, faculty_id))
        .get() as { name: string };

      newSubject.faculty_name = facultyName?.name ?? "";
      return newSubject;
    });
  }

  update(id: number, name: string): Subject {
    return withTransaction(db, () => {
      const updatedSubject = drizzleDb
        .update(subjects)
        .set({ name, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(subjects.id, id), isNull(subjects.deletedAt)))
        .returning({ id: subjects.id, faculty_id: subjects.facultyId, name: subjects.name })
        .get() as Subject;

      if (updatedSubject) {
        const facultyName = drizzleDb
          .select({ name: faculties.name })
          .from(faculties)
          .where(eq(faculties.id, updatedSubject.faculty_id))
          .get() as { name: string };
        updatedSubject.faculty_name = facultyName?.name ?? "";
      }
      return updatedSubject;
    });
  }

  delete(id: number): void {
    drizzleDb
      .update(subjects)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(subjects.id, id))
      .run();
  }
}

export const subjectRepository: SubjectRepository = new SubjectRepositoryImpl();
