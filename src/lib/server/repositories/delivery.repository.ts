import type { Delivery, OverviewDataDTO, Assignment, StudentGridRowDTO } from "$lib/types"; // Assuming OverviewDataDTO is in types

import db from "../db";

export interface DeliveryRepository {
  getOne(assignmentID: number, studentID: number): Delivery | null;
  getAllByCommission(commissionID: number): Delivery[];
  save(delivery: Delivery): void;
  getOverviewData(commissionID: number): OverviewDataDTO;
  getPendingSummary(): any[];
}

class DeliveryRepositoryImpl implements DeliveryRepository {
  getOne(assignmentID: number, studentID: number): Delivery | null {
    const stmt = db.prepare(
      "SELECT assignment_id, student_id, is_delivered, is_approved, grade, ai_level, comments FROM deliveries WHERE assignment_id = ? AND student_id = ? AND deletedAt IS NULL",
    );
    return stmt.get(assignmentID, studentID) as Delivery | null;
  }

  getAllByCommission(commissionID: number): Delivery[] {
    const stmt = db.prepare(`
            SELECT
                d.assignment_id,
                d.student_id,
                d.is_delivered,
                d.is_approved,
                d.grade,
                d.ai_level,
                d.comments
            FROM deliveries d
            JOIN students s ON d.student_id = s.id
            WHERE s.commission_id = ? AND d.deletedAt IS NULL AND s.deletedAt IS NULL
        `);
    return stmt.all(commissionID) as Delivery[];
  }

  save(delivery: Delivery): void {
    const stmt = db.prepare(`
            INSERT INTO deliveries (assignment_id, student_id, is_delivered, is_approved, grade, ai_level, comments)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(assignment_id, student_id) DO UPDATE SET
                is_delivered = EXCLUDED.is_delivered,
                is_approved = EXCLUDED.is_approved,
                grade = EXCLUDED.grade,
                ai_level = EXCLUDED.ai_level,
                comments = EXCLUDED.comments,
                updatedAt = CURRENT_TIMESTAMP,
                deletedAt = NULL
        `);
    stmt.run(
      delivery.assignment_id,
      delivery.student_id,
      delivery.is_delivered ? 1 : 0,
      delivery.is_approved ? 1 : 0,
      delivery.grade,
      delivery.ai_level,
      delivery.comments,
    );
  }

  getOverviewData(commissionID: number): OverviewDataDTO {
    const assignmentsStmt = db.prepare(
      "SELECT id, title FROM assignments WHERE deletedAt IS NULL AND period_id IN (SELECT id FROM periods WHERE subject_id IN (SELECT subject_id FROM commissions WHERE id = ?)) ORDER BY id",
    );
    const assignments = assignmentsStmt.all(commissionID) as Assignment[];

    const studentsStmt = db.prepare(
      "SELECT id, name FROM students WHERE commission_id = ? AND deletedAt IS NULL ORDER BY name",
    );
    const students = studentsStmt.all(commissionID) as {
      id: number;
      name: string;
    }[];

    const deliveriesStmt = db.prepare(
      "SELECT assignment_id, student_id, is_delivered, is_approved, grade, ai_level, comments FROM deliveries WHERE deletedAt IS NULL AND student_id IN (SELECT id FROM students WHERE commission_id = ? AND deletedAt IS NULL)",
    );
    const deliveries = deliveriesStmt.all(commissionID) as Delivery[];

    const grid: StudentGridRowDTO[] = students.map((s) => {
      const studentDeliveries = assignments.map((a) => {
        const delivery = deliveries.find((d) => d.student_id === s.id && d.assignment_id === a.id);
        return (
          delivery || {
            assignment_id: a.id,
            student_id: s.id,
            is_delivered: false,
            is_approved: false,
            grade: 0,
            ai_level: 0,
            comments: "",
          }
        );
      });
      return {
        id: s.id,
        name: s.name,
        deliveries: studentDeliveries,
      };
    });

    return { assignments, grid };
  }

  getPendingSummary(): any[] {
    const stmt = db.prepare(`
        SELECT 
            c.id as commission_id,
            c.name as commission_name,
            sub.name as subject_name,
            f.id as faculty_id,
            sub.id as subject_id,
            p.id as period_id,
            COUNT(s.id) - (
                SELECT COUNT(*) 
                FROM deliveries d 
                JOIN students s2 ON d.student_id = s2.id 
                WHERE s2.commission_id = c.id AND d.is_delivered = 1 AND d.deletedAt IS NULL
            ) as pending_count
        FROM commissions c
        JOIN periods p ON c.period_id = p.id
        JOIN subjects sub ON p.subject_id = sub.id
        JOIN faculties f ON sub.faculty_id = f.id
        LEFT JOIN students s ON s.commission_id = c.id AND s.deletedAt IS NULL
        WHERE c.deletedAt IS NULL AND p.deletedAt IS NULL AND sub.deletedAt IS NULL
        GROUP BY c.id
        HAVING pending_count > 0
        ORDER BY pending_count DESC
    `);
    return stmt.all();
  }

  getGlobalStats(): any {
    const totalStudentsStmt = db.prepare(
      "SELECT COUNT(*) as count FROM students WHERE deletedAt IS NULL",
    );
    const totalSubjectsStmt = db.prepare(
      "SELECT COUNT(*) as count FROM subjects WHERE deletedAt IS NULL",
    );
    const totalDeliveriesStmt = db.prepare(
      "SELECT COUNT(*) as count FROM deliveries WHERE deletedAt IS NULL AND is_delivered = 1",
    );
    const approvedDeliveriesStmt = db.prepare(
      "SELECT COUNT(*) as count FROM deliveries WHERE deletedAt IS NULL AND is_delivered = 1 AND is_approved = 1",
    );

    const totalStudents = (totalStudentsStmt.get() as any).count;
    const totalSubjects = (totalSubjectsStmt.get() as any).count;
    const totalDeliveries = (totalDeliveriesStmt.get() as any).count;
    const approvedDeliveries = (approvedDeliveriesStmt.get() as any).count;

    const approvalRate =
      totalDeliveries > 0 ? Math.round((approvedDeliveries / totalDeliveries) * 100) : 0;

    return {
      totalStudents,
      totalSubjects,
      totalDeliveries,
      approvalRate,
    };
  }
}

export const deliveryRepository: DeliveryRepository = new DeliveryRepositoryImpl();
