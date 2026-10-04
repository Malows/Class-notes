import { and, desc, eq, isNull, ne, sql } from "drizzle-orm";
import type { MetadataContextPayload, Period } from "$lib/common";

import db, { drizzleDb, withTransaction } from "../database/db";
import { periods, subjectPeriods, subjects } from "../database/schema";

export interface PeriodRepository {
  getAll(): Period[];
  getAllBySubject(subjectID: number): Period[];
  getById(id: number): Period | undefined;
  getByYearSemester(year: number, semester: number): Period | undefined;
  create(subject_id: number, year: number, semester: number): Period;
  update(id: number, year: number, semester: number): Period;
  delete(id: number): void;
  getActiveMetadata(now: Date): MetadataContextPayload;
}

class PeriodRepositoryImpl implements PeriodRepository {
  getAll(): Period[] {
    return drizzleDb
      .select({
        id: periods.id,
        year: periods.year,
        semester: periods.semester,
      })
      .from(periods)
      .where(isNull(periods.deletedAt))
      .orderBy(desc(periods.year), desc(periods.semester), desc(periods.id))
      .all() as Period[];
  }

  getAllBySubject(subjectID: number): Period[] {
    return drizzleDb
      .select({
        id: periods.id,
        year: periods.year,
        semester: periods.semester,
        subject_id: subjectPeriods.subjectId,
        subject_name: subjects.name,
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
      .where(and(eq(subjectPeriods.subjectId, subjectID), isNull(periods.deletedAt)))
      .orderBy(desc(periods.year), desc(periods.semester), desc(periods.id))
      .all() as Period[];
  }

  getById(id: number): Period | undefined {
    return drizzleDb
      .select({ id: periods.id, year: periods.year, semester: periods.semester })
      .from(periods)
      .where(and(eq(periods.id, id), isNull(periods.deletedAt)))
      .get() as Period | undefined;
  }

  getByYearSemester(year: number, semester: number): Period | undefined {
    return drizzleDb
      .select({ id: periods.id, year: periods.year, semester: periods.semester })
      .from(periods)
      .where(and(eq(periods.year, year), eq(periods.semester, semester), isNull(periods.deletedAt)))
      .orderBy(periods.id)
      .get() as Period | undefined;
  }

  create(subject_id: number, year: number, semester: number): Period {
    return withTransaction(db, () => {
      // Periods are shared across subjects: if an active period for this
      // (year, semester) already exists, link the subject to it instead of
      // creating a duplicate row (enforced by the unique index).
      const existingPeriod = drizzleDb
        .select({ id: periods.id })
        .from(periods)
        .where(and(eq(periods.year, year), eq(periods.semester, semester), isNull(periods.deletedAt)))
        .orderBy(periods.id)
        .get() as { id: number } | undefined;

      if (existingPeriod) {
        const existingLink = drizzleDb
          .select({ id: subjectPeriods.id })
          .from(subjectPeriods)
          .where(
            and(
              eq(subjectPeriods.periodId, existingPeriod.id),
              eq(subjectPeriods.subjectId, subject_id),
              isNull(subjectPeriods.deletedAt),
            ),
          )
          .get();

        if (existingLink) {
          throw new Error("Period already exists for this subject");
        }

        drizzleDb
          .insert(subjectPeriods)
          .values({ subjectId: subject_id, periodId: existingPeriod.id })
          .run();

        const subjectName = drizzleDb
          .select({ name: subjects.name })
          .from(subjects)
          .where(eq(subjects.id, subject_id))
          .get() as { name: string } | undefined;

        const period = { id: existingPeriod.id, year, semester } as Period;
        period.subject_id = subject_id;
        period.subject_name = subjectName?.name;
        return period;
      }

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
    // Periods are shared across subjects and (year, semester) is globally
    // unique, so editing a period into a combination that already exists
    // anywhere is a conflict handled with a friendly 409.
    const existingPeriod = drizzleDb
      .select({ id: periods.id })
      .from(periods)
      .where(
        and(
          eq(periods.year, year),
          eq(periods.semester, semester),
          ne(periods.id, id),
          isNull(periods.deletedAt),
        ),
      )
      .get() as { id: number } | undefined;

    if (existingPeriod) {
      throw new Error("Period already exists for this year and semester");
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

    // Southern academic year: semester 1 = Mar-Jul, semester 2 = Aug-Dec,
    // Jan-Feb fall back to the previous year's semester 2.
    const activeSemester = currentMonth >= 3 && currentMonth <= 7 ? 1 : 2;
    const activeYear = activeSemester === 1 || currentMonth >= 8 ? currentYear : currentYear - 1;

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
      .where(
        and(
          isNull(periods.deletedAt),
          eq(periods.year, activeYear),
          eq(periods.semester, activeSemester),
        ),
      )
      .all() as Array<{
      id: number;
      year: number;
      semester: number;
      subject_id: number;
      subject_name: string;
      faculty_id: number;
    }>;

    if (rows.length === 0) {
      return { periodData: null, subjects: [] };
    }

    const [first] = rows;
    const term = first.semester === 1 ? "Cuatrimestre I" : "Cuatrimestre II";
    const subjectItems = rows.map((row) => ({
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
