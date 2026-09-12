import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import type { Subject } from "$lib/common/types/academic";

import db, { drizzleDb, withTransaction } from "../database/db";
import { subjectPeriods, subjects, faculties } from "../database/schema";

export interface PeriodSubjectRepository {
  getAll(periodId: number): Subject[];
  sync(periodId: number, subjectIds: number[]): Subject[];
}

class PeriodSubjectRepositoryImpl implements PeriodSubjectRepository {
  getAll(periodId: number): Subject[] {
    return drizzleDb
      .select({
        id: subjects.id,
        faculty_id: subjects.facultyId,
        name: subjects.name,
        faculty_name: faculties.name,
      })
      .from(subjects)
      .innerJoin(faculties, eq(subjects.facultyId, faculties.id))
      .innerJoin(
        subjectPeriods,
        and(eq(subjectPeriods.subjectId, subjects.id), eq(subjectPeriods.periodId, periodId)),
      )
      .where(and(isNull(subjects.deletedAt), isNull(faculties.deletedAt), isNull(subjectPeriods.deletedAt)))
      .orderBy(subjects.name)
      .all() as Subject[];
  }

  sync(periodId: number, subjectIds: number[]): Subject[] {
    return withTransaction(db, () => {
      const existingLinks = drizzleDb
        .select({ subjectId: subjectPeriods.subjectId })
        .from(subjectPeriods)
        .where(and(eq(subjectPeriods.periodId, periodId), isNull(subjectPeriods.deletedAt)))
        .all() as Array<{ subjectId: number }>;

      const existingSubjectIds = new Set(existingLinks.map((link) => link.subjectId));
      const requestedSubjectIds = Array.from(new Set(subjectIds));
      const requestedSubjectIdSet = new Set(requestedSubjectIds);

      const toDelete = Array.from(existingSubjectIds).filter((subjectId) => !requestedSubjectIdSet.has(subjectId));
      if (toDelete.length > 0) {
        drizzleDb
          .update(subjectPeriods)
          .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
          .where(
            and(
              eq(subjectPeriods.periodId, periodId),
              inArray(subjectPeriods.subjectId, toDelete),
            ),
          )
          .run();
      }

      for (const subjectId of requestedSubjectIds) {
        const existing = drizzleDb
          .select({ id: subjectPeriods.id })
          .from(subjectPeriods)
          .where(
            and(
              eq(subjectPeriods.periodId, periodId),
              eq(subjectPeriods.subjectId, subjectId),
              isNull(subjectPeriods.deletedAt),
            ),
          )
          .get();

        if (!existing) {
          drizzleDb.insert(subjectPeriods).values({ subjectId, periodId }).run();
        }
      }

      return this.getAll(periodId);
    });
  }
}

export const periodSubjectRepository = new PeriodSubjectRepositoryImpl();