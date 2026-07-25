import { and, count, eq, isNull, sql } from "drizzle-orm";
import type { Commission } from "$lib/common/types/academic";

import db, { drizzleDb, withTransaction } from "../database/db";
import { commissions, students } from "../database/schema.drizzle";

export interface CommissionRepository {
  getAll(periodID?: number): Commission[];
  create(period_id: number, name: string): Commission;
  update(id: number, name: string): Commission;
  delete(id: number): void;
}

class CommissionRepositoryImpl implements CommissionRepository {
  getAll(periodID?: number): Commission[] {
    const conditions = [isNull(commissions.deletedAt)];
    if (periodID) {
      conditions.push(eq(commissions.periodId, periodID));
    }

    return drizzleDb
      .select({
        id: commissions.id,
        period_id: commissions.periodId,
        name: commissions.name,
        student_count: count(students.id),
      })
      .from(commissions)
      .leftJoin(
        students,
        and(eq(commissions.id, students.commissionId), isNull(students.deletedAt)),
      )
      .where(and(...conditions))
      .groupBy(commissions.id)
      .all() as Commission[];
  }

  create(period_id: number, name: string): Commission {
    return withTransaction(db, () => {
      const newCommission = drizzleDb
        .insert(commissions)
        .values({ periodId: period_id, name })
        .returning({ id: commissions.id, period_id: commissions.periodId, name: commissions.name })
        .get() as Commission;
      newCommission.student_count = 0;
      return newCommission;
    });
  }

  update(id: number, name: string): Commission {
    return withTransaction(db, () => {
      const updatedCommission = drizzleDb
        .update(commissions)
        .set({ name, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(commissions.id, id), isNull(commissions.deletedAt)))
        .returning({ id: commissions.id, period_id: commissions.periodId, name: commissions.name })
        .get() as Commission;

      if (updatedCommission) {
        const countResult = drizzleDb
          .select({ count: sql<number>`COUNT(*)` })
          .from(students)
          .where(and(eq(students.commissionId, id), isNull(students.deletedAt)))
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
