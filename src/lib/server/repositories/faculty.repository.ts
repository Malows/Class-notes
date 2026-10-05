import { and, eq, isNull, ne, sql } from "drizzle-orm";
import type { Faculty } from "$lib/common/types/academic";

import db, { drizzleDb, withTransaction } from "../database/db";
import { faculties } from "../database/schema";
import { buildUniqueSlug, slugify } from "../utils/slug";

export interface FacultyRepository {
  getAll(): Faculty[];
  create(name: string): Faculty;
  update(id: number, name: string): Faculty;
  delete(id: number): void;
}

class FacultyRepositoryImpl implements FacultyRepository {
  private slugFor(name: string, excludeId?: number): string {
    const base = slugify(name);

    return buildUniqueSlug(base, (candidate) => {
      const conditions = [eq(faculties.slug, candidate), isNull(faculties.deletedAt)];
      if (excludeId !== undefined) {
        conditions.push(ne(faculties.id, excludeId));
      }
      return Boolean(
        drizzleDb
          .select({ id: faculties.id })
          .from(faculties)
          .where(and(...conditions))
          .get(),
      );
    });
  }

  getAll(): Faculty[] {
    return drizzleDb
      .select({ id: faculties.id, name: faculties.name, slug: faculties.slug })
      .from(faculties)
      .where(isNull(faculties.deletedAt))
      .all() as Faculty[];
  }

  create(name: string): Faculty {
    return withTransaction(db, () => {
      const slug = this.slugFor(name);
      return drizzleDb
        .insert(faculties)
        .values({ name, slug })
        .returning({ id: faculties.id, name: faculties.name, slug: faculties.slug })
        .get() as Faculty;
    });
  }

  update(id: number, name: string): Faculty {
    return withTransaction(db, () => {
      const slug = this.slugFor(name, id);
      return drizzleDb
        .update(faculties)
        .set({ name, slug, updatedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(faculties.id, id), isNull(faculties.deletedAt)))
        .returning({ id: faculties.id, name: faculties.name, slug: faculties.slug })
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
