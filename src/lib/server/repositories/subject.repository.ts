import db from "../db";
import type { Subject } from "$lib/types";

export interface SubjectRepository {
  getAll(): Subject[];
  create(faculty_id: number, name: string): Subject;
  update(id: number, name: string): Subject;
  delete(id: number): void;
}

class SubjectRepositoryImpl implements SubjectRepository {
  getAll(): Subject[] {
    const stmt = db.prepare(
      "SELECT s.id, s.faculty_id, s.name, f.name AS faculty_name FROM subjects s JOIN faculties f ON s.faculty_id = f.id WHERE s.deletedAt IS NULL AND f.deletedAt IS NULL",
    );
    return stmt.all() as Subject[];
  }

  create(faculty_id: number, name: string): Subject {
    const stmt = db.prepare(
      "INSERT INTO subjects (faculty_id, name) VALUES (?, ?) RETURNING id, faculty_id, name",
    );
    const newSubject = stmt.get(faculty_id, name) as Subject;
    // Fetch faculty_name for the returned object
    const facultyStmt = db.prepare("SELECT name FROM faculties WHERE id = ?");
    newSubject.faculty_name = (facultyStmt.get(faculty_id) as any).name;
    return newSubject;
  }

  update(id: number, name: string): Subject {
    const stmt = db.prepare(
      "UPDATE subjects SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL RETURNING id, faculty_id, name",
    );
    const updatedSubject = stmt.get(name, id) as Subject;
    if (updatedSubject) {
      const facultyStmt = db.prepare("SELECT name FROM faculties WHERE id = ?");
      updatedSubject.faculty_name = (facultyStmt.get(updatedSubject.faculty_id) as any).name;
    }
    return updatedSubject;
  }

  delete(id: number): void {
    const stmt = db.prepare("UPDATE subjects SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(id);
  }
}

export const subjectRepository: SubjectRepository = new SubjectRepositoryImpl();
