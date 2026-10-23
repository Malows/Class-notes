import { and, count, eq, isNull, ne, sql } from "drizzle-orm";
import type { Commission } from "$lib/common/types/academic";

import db, { drizzleDb, withTransaction } from "../database/db";
import { commissions, enrollments } from "../database/schema";
import { buildUniqueSlug, slugify } from "../utils/slug";

export interface CommissionRepository {
  getAll(periodID?: number): Commission[];
  create(subject_id: number, period_id: number, name: string): Commission;
  update(id: number, name: string): Commission;
  delete(id: number): void;
}

class CommissionRepositoryImpl implements CommissionRepository {
  private slugFor(subjectId: number, periodId: number, name: string, excludeId?: number): string {
    const base = slugify(name);

    return buildUniqueSlug(base, (candidate) => {
      const conditions = [
        eq(commissions.subjectId, subjectId),
        eq(commissions.periodId, periodId),
        eq(commissions.slug, candidate),
        isNull(commissions.deletedAt),
      ];
      if (excludeId !== undefined) {
        conditions.push(ne(commissions.id, excludeId));
      }
      return Boolean(
        drizzleDb
          .select({ id: commissions.id })
          .from(commissions)
          .where(and(...conditions))
          .get(),
      );
    });
  }

  getAll(periodID?: number): Commission[] {
    const conditions = [isNull(commissions.deletedAt)];
    if (periodID) {
      conditions.push(eq(commissions.periodId, periodID));
    }

    return drizzleDb
      .select({
        id: commissions.id,
        subject_id: commissions.subjectId,
        period_id: commissions.periodId,
        name: commissions.name,
        slug: commissions.slug,
        student_count: count(enrollments.id),
      })
      .from(commissions)
      .leftJoin(
        enrollments,
        and(eq(commissions.id, enrollments.commissionId), isNull(enrollments.deletedAt)),
      )
      .where(and(...conditions))
      .groupBy(commissions.id)
      .all() as Commission[];
  }

  create(subject_id: number, period_id: number, name: string): Commission {
    return withTransaction(db, () => {
      const slug = this.slugFor(subject_id, period_id, name);
      const newCommission = drizzleDb
        .insert(commissions)
        .values({ subjectId: subject_id, periodId: period_id, name, slug })
        .returning({
          id: commissions.id,
          subject_id: commissions.subjectId,
          period_id: commissions.periodId,
          name: commissions.name,
          slug: commissions.slug,
        })
        .get() as Commission;
      newCommission.student_count = 0;
      return newCommission;
    });
  }

  update(id: number, name: string): Commission {
    return withTransaction(db, () => {
      const current = drizzleDb
        .select({
          subjectId: commissions.subjectId,
          periodId: commissions.periodId,
        })
        .from(commissions)
        .where(and(eq(commissions.id, id), isNull(commissions.deletedAt)))
        .get() as { subjectId: number; periodId: number } | undefined;

      const slug = this.slugFor(
        current?.subjectId ?? 0,
        current?.periodId ?? 0,
        name,
        id,
      );
      const updatedCommission = drizzleDb
        .update(commissions)
        .set({ name, slug, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(commissions.id, id), isNull(commissions.deletedAt)))
        .returning({
          id: commissions.id,
          subject_id: commissions.subjectId,
          period_id: commissions.periodId,
          name: commissions.name,
          slug: commissions.slug,
        })
        .get() as Commission;

      if (updatedCommission) {
        const countResult = drizzleDb
          .select({ count: sql<number>`COUNT(*)` })
          .from(enrollments)
          .where(and(eq(enrollments.commissionId, id), isNull(enrollments.deletedAt)))
          .get() as { count: number };
        updatedCommission.student_count = countResult?.count ?? 0;
      }
      return updatedCommission;
    });
  }

  delete(id: number): void {
    drizzleDb
      .update(commissions)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(commissions.id, id))
      .run();
  }
}

export const commissionRepository: CommissionRepository = new CommissionRepositoryImpl();