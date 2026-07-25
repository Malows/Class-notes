import { and, eq, isNull, sql } from "drizzle-orm";
import type { Faculty } from "$lib/common/types/academic";

import db, { drizzleDb, withTransaction } from "../database/db";
import { faculties } from "../database/schema.drizzle";

export interface FacultyRepository {
  getAll(): Faculty[];
  create(name: string): Faculty;
  update(id: number, name: string): Faculty;
  delete(id: number): void;
}

class FacultyRepositoryImpl implements FacultyRepository {
  getAll(): Faculty[] {
    return drizzleDb
      .select({ id: faculties.id, name: faculties.name })
      .from(faculties)
      .where(isNull(faculties.deletedAt))
      .all() as Faculty[];
  }

  create(name: string): Faculty {
    return withTransaction(db, () => {
      return drizzleDb
        .insert(faculties)
        .values({ name })
        .returning({ id: faculties.id, name: faculties.name })
        .get() as Faculty;
    });
  }

  update(id: number, name: string): Faculty {
    return withTransaction(db, () => {
      return drizzleDb
        .update(faculties)
        .set({ name, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(faculties.id, id), isNull(faculties.deletedAt)))
        .returning({ id: faculties.id, name: faculties.name })
        .get() as Faculty;
    });
  }

  delete(id: number): void {
    drizzleDb
      .update(faculties)
      .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(faculties.id, id))
      .run();
  }
}

export const facultyRepository: FacultyRepository = new FacultyRepositoryImpl();
