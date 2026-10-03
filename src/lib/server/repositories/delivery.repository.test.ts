import { describe, it, expect, afterEach } from "vitest";
import { deliveryRepository } from "./delivery.repository";
import { DeliveryWorkflowStatus } from "$lib/common";
import db from "../database/db";

describe("deliveryRepository Integration Tests", () => {
  const cleanupDeliveries: { assignmentId: number; studentId: number }[] = [];
  const cleanupStudents: number[] = [];
  const cleanupCommissions: number[] = [];

  afterEach(() => {
    for (const d of cleanupDeliveries) {
      db.prepare("DELETE FROM deliveries WHERE assignment_id = ? AND student_id = ?").run(
        d.assignmentId,
        d.studentId,
      );
    }
    for (const studentId of cleanupStudents) {
      db.prepare("DELETE FROM students WHERE id = ?").run(studentId);
    }
    for (const commissionId of cleanupCommissions) {
      db.prepare("DELETE FROM commissions WHERE id = ?").run(commissionId);
    }
    cleanupDeliveries.length = 0;
    cleanupStudents.length = 0;
    cleanupCommissions.length = 0;
  });

  it("retrieves and saves student delivery records", () => {
    // Create mock delivery record directly to test queries
    db.prepare(
      "INSERT OR REPLACE INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (1, 1, 'WAITING_FOR_CORRECTION', 0, 0, 'No comments')",
    ).run();
    cleanupDeliveries.push({ assignmentId: 1, studentId: 1 });

    const delivery = deliveryRepository.getOne(1, 1);
    expect(delivery).toBeTruthy();
    expect(delivery?.workflow_status).toBe("WAITING_FOR_CORRECTION");

    if (delivery) {
      // Update grade & status
      const updatedDelivery = {
        ...delivery,
        grade: 8.5,
        ai_level: 1,
        comments: "Well done!",
        workflow_status: DeliveryWorkflowStatus.APPROVED,
      };

      deliveryRepository.save(updatedDelivery);

      const retrieved = deliveryRepository.getOne(1, 1);
      expect(retrieved?.grade).toBe(8.5);
      expect(retrieved?.ai_level).toBe(1);
      expect(retrieved?.comments).toBe("Well done!");
      expect(retrieved?.workflow_status).toBe("APPROVED");
    }

    const list = deliveryRepository.getAllByCommission(1);
    expect(list.length).toBeGreaterThan(0);
  });

  it("retrieves commission-level and period-level overview datasets", () => {
    const commOverview = deliveryRepository.getCommissionOverviewData(1);
    expect(commOverview.assignments).toBeDefined();
    expect(commOverview.grid).toBeDefined();
    expect(commOverview.grid[0]?.deliveries).toHaveLength(commOverview.assignments.length);

    const periodOverview = deliveryRepository.getPeriodOverviewData(1);
    expect(periodOverview.assignments).toBeDefined();
    expect(periodOverview.grid).toBeDefined();
    expect(periodOverview.grid[0]?.deliveries).toHaveLength(periodOverview.assignments.length);
  });

  it("returns pending summary data and global stats", () => {
    const insertedCommissionId = db
      .prepare("INSERT INTO commissions (subject_id, period_id, name) VALUES (?, ?, ?)")
      .run(1, 1, "Comisión pendiente").lastInsertRowid as number;
    cleanupCommissions.push(insertedCommissionId);

    const insertedStudentId = db
      .prepare("INSERT INTO students (commission_id, name, external_id) VALUES (?, ?, ?)")
      .run(insertedCommissionId, "Alumno pendiente", "PENDING-001").lastInsertRowid as number;
    cleanupStudents.push(insertedStudentId);

    const pendingSummary = deliveryRepository.getPendingSummary();
    expect(pendingSummary.length).toBeGreaterThan(0);
    expect(pendingSummary[0]).toEqual(
      expect.objectContaining({
        commission_id: expect.any(Number),
        pending_count: expect.any(Number),
      }),
    );
    expect(pendingSummary.some((row) => row.pending_count > 0)).toBe(true);

    const stats = deliveryRepository.getGlobalStats();
    expect(stats).toEqual(
      expect.objectContaining({
        totalStudents: expect.any(Number),
        totalSubjects: expect.any(Number),
        totalDeliveries: expect.any(Number),
        approvalRate: expect.any(Number),
      }),
    );
  });

  it("uses default workflow status when saving a delivery without one", () => {
    const delivery = {
      assignment_id: 2,
      student_id: 2,
      grade: 5,
      ai_level: 0,
      comments: "",
    } as any;

    deliveryRepository.save(delivery);

    const saved = deliveryRepository.getOne(2, 2);
    expect(saved?.workflow_status).toBe(DeliveryWorkflowStatus.NOT_DICTATED);
    cleanupDeliveries.push({ assignmentId: 2, studentId: 2 });
  });
});
