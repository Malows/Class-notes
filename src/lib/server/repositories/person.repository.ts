import { and, desc, eq, isNull, like, or, sql } from "drizzle-orm";
import type {
  Person,
  PersonCursada,
  PersonDetail,
  PersonRegistryPage,
  PersonRegistryRow,
} from "$lib/common/types/enrollment";

import db, { drizzleDb, withTransaction } from "../database/db";
import {
  commissions,
  enrollments,
  faculties,
  periods,
  persons,
  subjectPeriods,
  subjects,
} from "../database/schema";

export class LegajoConflictError extends Error {
  constructor(legajo: string) {
    super(`Legajo already registered: ${legajo}`);
    this.name = "LegajoConflictError";
  }
}

export interface PersonRepository {
  create(name: string, legajo?: string | null): Person;
  findById(id: number): Person | null;
  findByLegajo(legajo: string): Person | null;
  search(query: string, limit?: number): Person[];
  list(query: string, limit?: number, offset?: number): PersonRegistryPage;
  findWithEnrollments(id: number): PersonDetail | null;
  update(id: number, name: string, legajo?: string | null): Person;
  delete(id: number): void;
}

const personColumns = {
  id: persons.id,
  name: persons.name,
  legajo: persons.legajo,
};

const normalizeLegajo = (legajo?: string | null): string | null => {
  const trimmed = legajo?.trim();
  return trimmed ? trimmed : null;
};

class PersonRepositoryImpl implements PersonRepository {
  create(name: string, legajo?: string | null): Person {
    const normalized = normalizeLegajo(legajo);

    if (normalized) {
      const existing = this.findByLegajo(normalized);
      if (existing) {
        throw new LegajoConflictError(normalized);
      }
    }

    return drizzleDb
      .insert(persons)
      .values({ name: name.trim(), legajo: normalized })
      .returning(personColumns)
      .get() as Person;
  }

  findById(id: number): Person | null {
    return (
      (drizzleDb
        .select(personColumns)
        .from(persons)
        .where(and(eq(persons.id, id), isNull(persons.deletedAt)))
        .get() as Person | undefined) ?? null
    );
  }

  findByLegajo(legajo: string): Person | null {
    const normalized = normalizeLegajo(legajo);
    if (!normalized) {
      return null;
    }

    return (
      (drizzleDb
        .select(personColumns)
        .from(persons)
        .where(and(eq(persons.legajo, normalized), isNull(persons.deletedAt)))
        .get() as Person | undefined) ?? null
    );
  }

  search(query: string, limit = 20): Person[] {
    const term = query.trim();
    if (!term) {
      return [];
    }

    const pattern = `%${term}%`;

    return drizzleDb
      .select(personColumns)
      .from(persons)
      .where(
        and(
          isNull(persons.deletedAt),
          or(like(persons.name, pattern), like(persons.legajo, pattern)),
        ),
      )
      .orderBy(persons.name)
      .limit(limit)
      .all() as Person[];
  }

  list(query: string, limit = 50, offset = 0): PersonRegistryPage {
    const term = query.trim();
    const pattern = term ? `%${term}%` : null;
    const where = pattern
      ? and(
          isNull(persons.deletedAt),
          or(like(persons.name, pattern), like(persons.legajo, pattern)),
        )
      : isNull(persons.deletedAt);

    const lastCursada = (column: string) => sql`(
      SELECT ${sql.raw(column)}
        FROM enrollments e
        JOIN subject_periods sp ON sp.id = e.subject_period_id
        JOIN subjects s ON s.id = sp.subject_id
        JOIN periods p ON p.id = sp.period_id
       WHERE e.person_id = ${persons.id} AND e.deletedAt IS NULL
       ORDER BY p.year DESC, p.semester DESC, sp.id DESC
       LIMIT 1
    )`;

    const items = drizzleDb
      .select({
        id: persons.id,
        name: persons.name,
        legajo: persons.legajo,
        enrollment_count: sql<number>`COUNT(${enrollments.id})`,
        last_subject_name: lastCursada("s.name"),
        last_period_year: lastCursada("p.year"),
        last_period_semester: lastCursada("p.semester"),
      })
      .from(persons)
      .leftJoin(
        enrollments,
        and(eq(enrollments.personId, persons.id), isNull(enrollments.deletedAt)),
      )
      .where(where)
      .groupBy(persons.id)
      .orderBy(persons.name, persons.id)
      .limit(limit)
      .offset(offset)
      .all() as PersonRegistryRow[];

    const total = drizzleDb
      .select({ count: sql<number>`COUNT(*)` })
      .from(persons)
      .where(where)
      .get() as { count: number };

    return { items, total: total?.count ?? 0, limit, offset };
  }

  findWithEnrollments(id: number): PersonDetail | null {
    const person = this.findById(id);
    if (!person) {
      return null;
    }

    const cursadas = drizzleDb
      .select({
        id: enrollments.id,
        subject_period_id: enrollments.subjectPeriodId,
        commission_id: enrollments.commissionId,
        subject_name: subjects.name,
        subject_slug: subjects.slug,
        period_year: periods.year,
        period_semester: periods.semester,
        commission_name: commissions.name,
        commission_slug: commissions.slug,
        faculty_slug: faculties.slug,
        faculty_name: faculties.name,
      })
      .from(enrollments)
      .innerJoin(subjectPeriods, eq(subjectPeriods.id, enrollments.subjectPeriodId))
      .innerJoin(subjects, eq(subjects.id, subjectPeriods.subjectId))
      .innerJoin(periods, eq(periods.id, subjectPeriods.periodId))
      .innerJoin(faculties, eq(faculties.id, subjects.facultyId))
      .leftJoin(
        commissions,
        and(eq(commissions.id, enrollments.commissionId), isNull(commissions.deletedAt)),
      )
      .where(and(eq(enrollments.personId, id), isNull(enrollments.deletedAt)))
      .orderBy(desc(periods.year), desc(periods.semester), subjects.name)
      .all() as PersonCursada[];

    return { person, enrollments: cursadas };
  }

  update(id: number, name: string, legajo?: string | null): Person {
    const normalized = normalizeLegajo(legajo);

    return withTransaction(db, () => {
      if (normalized) {
        const existing = this.findByLegajo(normalized);
        if (existing && existing.id !== id) {
          throw new LegajoConflictError(normalized);
        }
      }

      return drizzleDb
        .update(persons)
        .set({ name: name.trim(), legajo: normalized, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(persons.id, id), isNull(persons.deletedAt)))
        .returning(personColumns)
        .get() as Person;
    });
  }

  delete(id: number): void {
    withTransaction(db, () => {
      drizzleDb
        .update(enrollments)
        .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(enrollments.personId, id), isNull(enrollments.deletedAt)))
        .run();

      drizzleDb
        .update(persons)
        .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
        .where(eq(persons.id, id))
        .run();
    });
  }
}

export const personRepository: PersonRepository = new PersonRepositoryImpl();
