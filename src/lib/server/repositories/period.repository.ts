import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import type { MetadataContextPayload, Period } from "$lib/common";

import db, { drizzleDb, withTransaction } from "../database/db";
import { periods, subjectPeriods, subjects } from "../database/schema.drizzle";

export interface PeriodRepository {
  getAll(subjectID?: number): Period[];
  create(subject_id: number, year: number, semester: number): Period;
  update(id: number, year: number, semester: number): Period;
  delete(id: number): void;
  getActiveMetadata(now: Date): MetadataContextPayload;
}

class PeriodRepositoryImpl implements PeriodRepository {
  getAll(subjectID?: number): Period[] {
    const conditions = [isNull(periods.deletedAt)];
    if (subjectID) {
      conditions.push(eq(subjectPeriods.subjectId, subjectID));
    }

    return drizzleDb
      .select({
        id: periods.id,
        year: periods.year,
        semester: periods.semester,
        subject_id: subjectPeriods.subjectId,
        subject_name: subjects.name,
      })
      .from(periods)
      .leftJoin(
        subjectPeriods,
        and(eq(periods.id, subjectPeriods.periodId), isNull(subjectPeriods.deletedAt)),
      )
      .leftJoin(
        subjects,
        and(eq(subjectPeriods.subjectId, subjects.id), isNull(subjects.deletedAt)),
      )
      .where(and(...conditions))
      .orderBy(desc(periods.year), desc(periods.semester), desc(periods.id))
      .all() as Period[];
  }

  create(subject_id: number, year: number, semester: number): Period {
    const existingPeriod = drizzleDb
      .select({ id: periods.id })
      .from(periods)
      .innerJoin(
        subjectPeriods,
        and(eq(periods.id, subjectPeriods.periodId), isNull(subjectPeriods.deletedAt)),
      )
      .where(
        and(
          eq(periods.year, year),
          eq(periods.semester, semester),
          eq(subjectPeriods.subjectId, subject_id),
          isNull(periods.deletedAt),
        ),
      )
      .get() as { id: number } | undefined;

    if (existingPeriod) {
      throw new Error("Period already exists for this subject");
    }

    return withTransaction(db, () => {
      const newPeriod = drizzleDb
        .insert(periods)
        .values({ year, semester })
        .returning({ id: periods.id, year: periods.year, semester: periods.semester })
        .get() as Period;

      drizzleDb
        .insert(subjectPeriods)
        .values({ subjectId: subject_id, periodId: newPeriod.id })
        .run();

      const subjectName = drizzleDb
        .select({ name: subjects.name })
        .from(subjects)
        .where(eq(subjects.id, subject_id))
        .get() as { name: string } | undefined;

      newPeriod.subject_id = subject_id;
      newPeriod.subject_name = subjectName?.name;
      return newPeriod;
    });
  }

  update(id: number, year: number, semester: number): Period {
    const subjectLink = drizzleDb
      .select({ subjectId: subjectPeriods.subjectId })
      .from(subjectPeriods)
      .where(and(eq(subjectPeriods.periodId, id), isNull(subjectPeriods.deletedAt)))
      .orderBy(subjectPeriods.id)
      .get() as { subjectId: number } | undefined;

    if (subjectLink) {
      const existingPeriod = drizzleDb
        .select({ id: periods.id })
        .from(periods)
        .innerJoin(
          subjectPeriods,
          and(eq(periods.id, subjectPeriods.periodId), isNull(subjectPeriods.deletedAt)),
        )
        .where(
          and(
            eq(periods.year, year),
            eq(periods.semester, semester),
            eq(subjectPeriods.subjectId, subjectLink.subjectId),
            ne(periods.id, id),
            isNull(periods.deletedAt),
          ),
        )
        .get() as { id: number } | undefined;

      if (existingPeriod) {
        throw new Error("Period already exists for this subject");
      }
    }

    return withTransaction(db, () => {
      const updatedPeriod = drizzleDb
        .update(periods)
        .set({ year, semester, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(periods.id, id), isNull(periods.deletedAt)))
        .returning({ id: periods.id, year: periods.year, semester: periods.semester })
        .get() as Period;

      if (updatedPeriod) {
        const subjectLink = drizzleDb
          .select({ subjectId: subjectPeriods.subjectId })
          .from(subjectPeriods)
          .where(and(eq(subjectPeriods.periodId, id), isNull(subjectPeriods.deletedAt)))
          .orderBy(subjectPeriods.id)
          .get() as { subjectId: number } | undefined;

        if (subjectLink) {
          const subjectName = drizzleDb
            .select({ name: subjects.name })
            .from(subjects)
            .where(eq(subjects.id, subjectLink.subjectId))
            .get() as { name: string } | undefined;

          updatedPeriod.subject_id = subjectLink.subjectId;
          updatedPeriod.subject_name = subjectName?.name;
        }
      }
      return updatedPeriod;
    });
  }

  delete(id: number): void {
    drizzleDb
      .update(periods)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(periods.id, id))
      .run();
  }

  getActiveMetadata(now: Date): MetadataContextPayload {
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const rows = drizzleDb
      .select({
        id: periods.id,
        year: periods.year,
        semester: periods.semester,
        subject_id: subjects.id,
        subject_name: subjects.name,
        faculty_id: subjects.facultyId,
      })
      .from(periods)
      .innerJoin(
        subjectPeriods,
        and(eq(periods.id, subjectPeriods.periodId), isNull(subjectPeriods.deletedAt)),
      )
      .innerJoin(
        subjects,
        and(eq(subjectPeriods.subjectId, subjects.id), isNull(subjects.deletedAt)),
      )
      .where(and(isNull(periods.deletedAt), eq(periods.year, currentYear)))
      .all() as Array<{
      id: number;
      year: number;
      semester: number;
      subject_id: number;
      subject_name: string;
      faculty_id: number;
    }>;

    const filteredRows = rows.filter((row) =>
      row.semester === 1 ? currentMonth <= 1 : currentMonth <= 2,
    );

    if (filteredRows.length === 0) {
      return { periodData: null, subjects: [] };
    }

    const [first] = filteredRows;
    const term = first.semester === 1 ? "Cuatrimestre I" : "Cuatrimestre II";
    const subjectItems = filteredRows.map((row) => ({
      id: String(row.subject_id),
      name: row.subject_name,
      href: `/faculties/${row.faculty_id}/subjects/${row.subject_id}/periods`,
    }));

    return {
      periodData: {
        year: first.year,
        term,
      },
      subjects: subjectItems,
    };
  }
}

export const periodRepository: PeriodRepository = new PeriodRepositoryImpl();
