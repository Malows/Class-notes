import { and, eq, isNull, sql } from "drizzle-orm";
import type { Student } from "$lib/common/types/student";

import db, { drizzleDb, withTransaction } from "../database/db";
import { students } from "../database/schema";

export interface StudentRepository {
  getAll(commissionID?: number): Student[];
  createBulk(commissionID: number, names: string[]): void;
  update(id: number, name: string): Student;
  delete(id: number): void;
}

class StudentRepositoryImpl implements StudentRepository {
  getAll(commissionID?: number): Student[] {
    const conditions = [isNull(students.deletedAt)];
    if (commissionID) {
      conditions.push(eq(students.commissionId, commissionID));
    }

    return drizzleDb
      .select({ id: students.id, commission_id: students.commissionId, name: students.name })
      .from(students)
      .where(and(...conditions))
      .all() as Student[];
  }

  createBulk(commissionID: number, names: string[]): void {
    withTransaction(db, () => {
      for (const name of names) {
        drizzleDb.insert(students).values({ commissionId: commissionID, name }).run();
      }
    });
  }

  update(id: number, name: string): Student {
    return drizzleDb
      .update(students)
      .set({ name, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(and(eq(students.id, id), isNull(students.deletedAt)))
      .returning({ id: students.id, commission_id: students.commissionId, name: students.name })
      .get() as Student;
  }

  delete(id: number): void {
    drizzleDb
      .update(students)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(students.id, id))
      .run();
  }
}

export const studentRepository: StudentRepository = new StudentRepositoryImpl();
