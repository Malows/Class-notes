import type { Database } from "better-sqlite3";

export function createSchema(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS faculties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      faculty_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME DEFAULT NULL,
      FOREIGN KEY(faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      semester INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME DEFAULT NULL,
      FOREIGN KEY(subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS commissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME DEFAULT NULL,
      FOREIGN KEY(period_id) REFERENCES periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      commission_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      external_id TEXT DEFAULT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME DEFAULT NULL,
      FOREIGN KEY(commission_id) REFERENCES commissions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT DEFAULT NULL,
      workflow_status TEXT NOT NULL DEFAULT 'NOT_DICTATED' CHECK (
        workflow_status IN ('NOT_DICTATED', 'WAITING_FOR_STUDENTS', 'WAITING_FOR_CORRECTION')
      ),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME DEFAULT NULL,
      FOREIGN KEY(period_id) REFERENCES periods(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deliveries (
      assignment_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      workflow_status TEXT NOT NULL DEFAULT 'NOT_DICTATED' CHECK (
        workflow_status IN ('NOT_DICTATED', 'WAITING_FOR_STUDENTS', 'WAITING_FOR_CORRECTION', 'APPROVED', 'REJECTED')
      ),
      grade REAL DEFAULT 0,
      ai_level INTEGER DEFAULT 0,
      comments TEXT DEFAULT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      deletedAt DATETIME DEFAULT NULL,
      PRIMARY KEY(assignment_id, student_id),
      FOREIGN KEY(assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE
    );
  `);
}
