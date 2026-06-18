import type { Faculty } from "$lib/types";

import db from "../db";

export interface FacultyRepository {
  getAll(): Faculty[];
  create(name: string): Faculty;
  update(id: number, name: string): Faculty;
  delete(id: number): void;
}

class FacultyRepositoryImpl implements FacultyRepository {
  getAll(): Faculty[] {
    const stmt = db.prepare("SELECT id, name FROM faculties WHERE deletedAt IS NULL");
    return stmt.all() as Faculty[];
  }

  create(name: string): Faculty {
    const stmt = db.prepare("INSERT INTO faculties (name) VALUES (?) RETURNING id, name");
    return stmt.get(name) as Faculty;
  }

  update(id: number, name: string): Faculty {
    const stmt = db.prepare(
      "UPDATE faculties SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL RETURNING id, name",
    );
    return stmt.get(name, id) as Faculty;
  }

  delete(id: number): void {
    const stmt = db.prepare("UPDATE faculties SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(id);
  }
}

export const facultyRepository: FacultyRepository = new FacultyRepositoryImpl();
