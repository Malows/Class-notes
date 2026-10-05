import { and, eq, isNull, ne, sql } from "drizzle-orm";
import type { Subject } from "$lib/common/types/academic";

import db, { drizzleDb, withTransaction } from "../database/db";
import { faculties, subjects } from "../database/schema";
import { buildUniqueSlug, slugify } from "../utils/slug";

export interface SubjectRepository {
  getAll(): Subject[];
  create(faculty_id: number, name: string): Subject;
  update(id: number, name: string): Subject;
  delete(id: number): void;
}

class SubjectRepositoryImpl implements SubjectRepository {
  private slugFor(facultyId: number, name: string, excludeId?: number): string {
    const base = slugify(name);

    return buildUniqueSlug(base, (candidate) => {
      const conditions = [
        eq(subjects.facultyId, facultyId),
        eq(subjects.slug, candidate),
        isNull(subjects.deletedAt),
      ];
      if (excludeId !== undefined) {
        conditions.push(ne(subjects.id, excludeId));
      }
      return Boolean(
        drizzleDb
          .select({ id: subjects.id })
          .from(subjects)
          .where(and(...conditions))
          .get(),
      );
    });
  }

  private facultyMeta(facultyId: number): { name: string; slug: string } {
    const faculty = drizzleDb
      .select({ name: faculties.name, slug: faculties.slug })
      .from(faculties)
      .where(eq(faculties.id, facultyId))
      .get() as { name: string; slug: string } | undefined;
    return { name: faculty?.name ?? "", slug: faculty?.slug ?? "" };
  }

  getAll(): Subject[] {
    return drizzleDb
      .select({
        id: subjects.id,
        faculty_id: subjects.facultyId,
        name: subjects.name,
        slug: subjects.slug,
        faculty_name: faculties.name,
        faculty_slug: faculties.slug,
      })
      .from(subjects)
      .innerJoin(faculties, eq(subjects.facultyId, faculties.id))
      .where(and(isNull(subjects.deletedAt), isNull(faculties.deletedAt)))
      .all() as Subject[];
  }

  create(faculty_id: number, name: string): Subject {
    return withTransaction(db, () => {
      const slug = this.slugFor(faculty_id, name);
      const newSubject = drizzleDb
        .insert(subjects)
        .values({ facultyId: faculty_id, name, slug })
        .returning({
          id: subjects.id,
          faculty_id: subjects.facultyId,
          name: subjects.name,
          slug: subjects.slug,
        })
        .get() as Subject;

      const faculty = this.facultyMeta(faculty_id);
      newSubject.faculty_name = faculty.name;
      newSubject.faculty_slug = faculty.slug;
      return newSubject;
    });
  }

  update(id: number, name: string): Subject {
    return withTransaction(db, () => {
      const current = drizzleDb
        .select({ facultyId: subjects.facultyId })
        .from(subjects)
        .where(and(eq(subjects.id, id), isNull(subjects.deletedAt)))
        .get() as { facultyId: number } | undefined;

      const slug = this.slugFor(current?.facultyId ?? 0, name, id);
      const updatedSubject = drizzleDb
        .update(subjects)
        .set({ name, slug, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(subjects.id, id), isNull(subjects.deletedAt)))
        .returning({
          id: subjects.id,
          faculty_id: subjects.facultyId,
          name: subjects.name,
          slug: subjects.slug,
        })
        .get() as Subject;

      if (updatedSubject) {
        const faculty = this.facultyMeta(updatedSubject.faculty_id);
        updatedSubject.faculty_name = faculty.name;
        updatedSubject.faculty_slug = faculty.slug;
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
