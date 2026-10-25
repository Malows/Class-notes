import { and, eq, isNull, sql } from "drizzle-orm";
import type {
  CursadaRoster,
  CursadaRosterCommission,
  CursadaRosterStudent,
  EnrollmentWithPerson,
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

export class EnrollmentConflictError extends Error {
  constructor() {
    super("Person is already enrolled in this cursada");
    this.name = "EnrollmentConflictError";
  }
}

export class CrossCursadaError extends Error {
  constructor() {
    super("Commission does not belong to the cursada of this enrollment");
    this.name = "CrossCursadaError";
  }
}

export interface EnrollmentRepository {
  getRoster(commissionId: number): EnrollmentWithPerson[];
  getByCursada(subjectPeriodId: number): EnrollmentWithPerson[];
  getCursadaRoster(subjectPeriodId: number): CursadaRoster | null;
  getPending(subjectPeriodId: number): EnrollmentWithPerson[];
  findById(id: number): EnrollmentWithPerson | null;
  findByPersonAndCursada(personId: number, subjectPeriodId: number): EnrollmentWithPerson | null;
  enroll(
    personId: number,
    subjectPeriodId: number,
    commissionId?: number | null,
  ): EnrollmentWithPerson;
  assignCommission(id: number, commissionId: number | null): EnrollmentWithPerson;
  remove(id: number): void;
}

const enrollmentColumns = {
  id: enrollments.id,
  person_id: enrollments.personId,
  subject_period_id: enrollments.subjectPeriodId,
  commission_id: enrollments.commissionId,
  name: persons.name,
  legajo: persons.legajo,
};

class EnrollmentRepositoryImpl implements EnrollmentRepository {
  private baseQuery() {
    return drizzleDb
      .select(enrollmentColumns)
      .from(enrollments)
      .innerJoin(persons, eq(enrollments.personId, persons.id));
  }

  private assertCommissionInCursada(commissionId: number, subjectPeriodId: number): void {
    const cursada = drizzleDb
      .select({ subjectId: subjectPeriods.subjectId, periodId: subjectPeriods.periodId })
      .from(subjectPeriods)
      .where(and(eq(subjectPeriods.id, subjectPeriodId), isNull(subjectPeriods.deletedAt)))
      .get() as { subjectId: number; periodId: number } | undefined;

    const commission = drizzleDb
      .select({ subjectId: commissions.subjectId, periodId: commissions.periodId })
      .from(commissions)
      .where(and(eq(commissions.id, commissionId), isNull(commissions.deletedAt)))
      .get() as { subjectId: number; periodId: number } | undefined;

    if (
      !cursada ||
      !commission ||
      commission.subjectId !== cursada.subjectId ||
      commission.periodId !== cursada.periodId
    ) {
      throw new CrossCursadaError();
    }
  }

  getRoster(commissionId: number): EnrollmentWithPerson[] {
    return this.baseQuery()
      .where(
        and(
          eq(enrollments.commissionId, commissionId),
          isNull(enrollments.deletedAt),
          isNull(persons.deletedAt),
        ),
      )
      .orderBy(persons.name)
      .all() as EnrollmentWithPerson[];
  }

  getByCursada(subjectPeriodId: number): EnrollmentWithPerson[] {
    return this.baseQuery()
      .where(
        and(
          eq(enrollments.subjectPeriodId, subjectPeriodId),
          isNull(enrollments.deletedAt),
          isNull(persons.deletedAt),
        ),
      )
      .orderBy(persons.name)
      .all() as EnrollmentWithPerson[];
  }

  getCursadaRoster(subjectPeriodId: number): CursadaRoster | null {
    const cursada = drizzleDb
      .select({
        subject_id: subjects.id,
        subject_name: subjects.name,
        subject_slug: subjects.slug,
        faculty_slug: faculties.slug,
        period_id: periods.id,
        period_year: periods.year,
        period_semester: periods.semester,
      })
      .from(subjectPeriods)
      .innerJoin(subjects, eq(subjects.id, subjectPeriods.subjectId))
      .innerJoin(faculties, eq(faculties.id, subjects.facultyId))
      .innerJoin(periods, eq(periods.id, subjectPeriods.periodId))
      .where(
        and(
          eq(subjectPeriods.id, subjectPeriodId),
          isNull(subjectPeriods.deletedAt),
          isNull(subjects.deletedAt),
          isNull(faculties.deletedAt),
          isNull(periods.deletedAt),
        ),
      )
      .get() as
      | {
          subject_id: number;
          subject_name: string;
          subject_slug: string;
          faculty_slug: string;
          period_id: number;
          period_year: number;
          period_semester: number;
        }
      | undefined;

    if (!cursada) {
      return null;
    }

    const students = drizzleDb
      .select({
        enrollment_id: enrollments.id,
        person_id: persons.id,
        name: persons.name,
        legajo: persons.legajo,
        commission_id: commissions.id,
        commission_name: commissions.name,
        commission_slug: commissions.slug,
      })
      .from(enrollments)
      .innerJoin(persons, eq(persons.id, enrollments.personId))
      .leftJoin(
        commissions,
        and(eq(commissions.id, enrollments.commissionId), isNull(commissions.deletedAt)),
      )
      .where(
        and(
          eq(enrollments.subjectPeriodId, subjectPeriodId),
          isNull(enrollments.deletedAt),
          isNull(persons.deletedAt),
        ),
      )
      .orderBy(persons.name)
      .all() as CursadaRosterStudent[];

    const cursadaCommissions = drizzleDb
      .select({ id: commissions.id, name: commissions.name, slug: commissions.slug })
      .from(commissions)
      .where(
        and(
          eq(commissions.subjectId, cursada.subject_id),
          eq(commissions.periodId, cursada.period_id),
          isNull(commissions.deletedAt),
        ),
      )
      .orderBy(commissions.name)
      .all() as CursadaRosterCommission[];

    return {
      subject: {
        id: cursada.subject_id,
        name: cursada.subject_name,
        slug: cursada.subject_slug,
        faculty_slug: cursada.faculty_slug,
      },
      period: {
        id: cursada.period_id,
        year: cursada.period_year,
        semester: cursada.period_semester,
      },
      commissions: cursadaCommissions,
      students,
    };
  }

  getPending(subjectPeriodId: number): EnrollmentWithPerson[] {
    return this.baseQuery()
      .where(
        and(
          eq(enrollments.subjectPeriodId, subjectPeriodId),
          isNull(enrollments.commissionId),
          isNull(enrollments.deletedAt),
          isNull(persons.deletedAt),
        ),
      )
      .orderBy(persons.name)
      .all() as EnrollmentWithPerson[];
  }

  findById(id: number): EnrollmentWithPerson | null {
    return (
      (this.baseQuery()
        .where(
          and(eq(enrollments.id, id), isNull(enrollments.deletedAt), isNull(persons.deletedAt)),
        )
        .get() as EnrollmentWithPerson | undefined) ?? null
    );
  }

  findByPersonAndCursada(
    personId: number,
    subjectPeriodId: number,
  ): EnrollmentWithPerson | null {
    return (
      (this.baseQuery()
        .where(
          and(
            eq(enrollments.personId, personId),
            eq(enrollments.subjectPeriodId, subjectPeriodId),
            isNull(enrollments.deletedAt),
            isNull(persons.deletedAt),
          ),
        )
        .get() as EnrollmentWithPerson | undefined) ?? null
    );
  }

  enroll(
    personId: number,
    subjectPeriodId: number,
    commissionId?: number | null,
  ): EnrollmentWithPerson {
    return withTransaction(db, () => {
      if (this.findByPersonAndCursada(personId, subjectPeriodId)) {
        throw new EnrollmentConflictError();
      }

      if (commissionId !== undefined && commissionId !== null) {
        this.assertCommissionInCursada(commissionId, subjectPeriodId);
      }

      const created = drizzleDb
        .insert(enrollments)
        .values({
          personId,
          subjectPeriodId,
          commissionId: commissionId ?? null,
        })
        .returning({ id: enrollments.id })
        .get() as { id: number };

      return this.findById(created.id) as EnrollmentWithPerson;
    });
  }

  assignCommission(id: number, commissionId: number | null): EnrollmentWithPerson {
    return withTransaction(db, () => {
      const current = this.findById(id);
      if (!current) {
        throw new Error("Enrollment not found");
      }

      if (commissionId !== null) {
        this.assertCommissionInCursada(commissionId, current.subject_period_id);
      }

      drizzleDb
        .update(enrollments)
        .set({ commissionId, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(enrollments.id, id), isNull(enrollments.deletedAt)))
        .run();

      return this.findById(id) as EnrollmentWithPerson;
    });
  }

  remove(id: number): void {
    drizzleDb
      .update(enrollments)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(enrollments.id, id))
      .run();
  }
}

export const enrollmentRepository: EnrollmentRepository = new EnrollmentRepositoryImpl();
