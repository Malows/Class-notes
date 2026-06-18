import type { Student } from "$lib/types";

import db from "../db";

export interface StudentRepository {
  getAll(commissionID?: number): Student[];
  createBulk(commissionID: number, names: string[]): void;
  update(id: number, name: string): Student;
  delete(id: number): void;
}

class StudentRepositoryImpl implements StudentRepository {
  getAll(commissionID?: number): Student[] {
    let query = "SELECT id, commission_id, name FROM students WHERE deletedAt IS NULL";
    const params: number[] = [];
    if (commissionID) {
      query += " AND commission_id = ?";
      params.push(commissionID);
    }
    const stmt = db.prepare(query);
    return stmt.all(params) as Student[];
  }

  createBulk(commissionID: number, names: string[]): void {
    const insert = db.prepare("INSERT INTO students (commission_id, name) VALUES (?, ?)");
    const insertMany = db.transaction((studentsToInsert) => {
      for (const name of studentsToInsert) {
        insert.run(commissionID, name);
      }
    });
    insertMany(names);
  }

  update(id: number, name: string): Student {
    const stmt = db.prepare(
      "UPDATE students SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL RETURNING id, commission_id, name",
    );
    return stmt.get(name, id) as Student;
  }

  delete(id: number): void {
    const stmt = db.prepare("UPDATE students SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(id);
  }
}

export const studentRepository: StudentRepository = new StudentRepositoryImpl();
