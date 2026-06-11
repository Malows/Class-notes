import db from "../db";
import type { Commission } from "$lib/types";

export interface CommissionRepository {
  getAll(periodID?: number): Commission[];
  create(period_id: number, name: string): Commission;
  update(id: number, name: string): Commission;
  delete(id: number): void;
}

class CommissionRepositoryImpl implements CommissionRepository {
  getAll(periodID?: number): Commission[] {
    let query =
      "SELECT c.id, c.period_id, c.name, COUNT(s.id) AS student_count FROM commissions c LEFT JOIN students s ON c.id = s.commission_id AND s.deletedAt IS NULL WHERE c.deletedAt IS NULL";
    const params: number[] = [];
    if (periodID) {
      query += " AND c.period_id = ?";
      params.push(periodID);
    }
    query += " GROUP BY c.id";
    const stmt = db.prepare(query);
    return stmt.all(params) as Commission[];
  }

  create(period_id: number, name: string): Commission {
    const stmt = db.prepare(
      "INSERT INTO commissions (period_id, name) VALUES (?, ?) RETURNING id, period_id, name",
    );
    const newCommission = stmt.get(period_id, name) as Commission;
    newCommission.student_count = 0; // Initially no students
    return newCommission;
  }

  update(id: number, name: string): Commission {
    const stmt = db.prepare(
      "UPDATE commissions SET name = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL RETURNING id, period_id, name",
    );
    const updatedCommission = stmt.get(name, id) as Commission;
    if (updatedCommission) {
      // Fetch student count
      const countStmt = db.prepare(
        "SELECT COUNT(*) as count FROM students WHERE commission_id = ? AND deletedAt IS NULL",
      );
      updatedCommission.student_count = (countStmt.get(id) as any).count;
    }
    return updatedCommission;
  }

  delete(id: number): void {
    const stmt = db.prepare("UPDATE commissions SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?");
    stmt.run(id);
  }
}

export const commissionRepository: CommissionRepository = new CommissionRepositoryImpl();
