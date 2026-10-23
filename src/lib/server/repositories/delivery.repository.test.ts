import { describe, it, expect, afterEach } from "vitest";
import { deliveryRepository } from "./delivery.repository";
import { DeliveryWorkflowStatus } from "$lib/common";
import db from "../database/db";

// Seeded fixtures: cursada 1 = subject 1 (Álgebra Lineal) x period 2 (2025-1),
// holding commissions 1 and 2 with enrollments 1..8.
const SUBJECT_ALGEBRA = 1;
const PERIOD_2025_1 = 2;
const CURSADA_ALGEBRA = 1;

describe("deliveryRepository Integration Tests", () => {
  const cleanupDeliveries: { assignmentId: number; enrollmentId: number }[] = [];
  const cleanupPersons: number[] = [];
  const cleanupCommissions: number[] = [];

  afterEach(() => {
    for (const d of cleanupDeliveries) {
      db.prepare("DELETE FROM deliveries WHERE assignment_id = ? AND enrollment_id = ?").run(
        d.assignmentId,
        d.enrollmentId,
      );
    }
    for (const personId of cleanupPersons) {
      db.prepare("DELETE FROM enrollments WHERE person_id = ?").run(personId);
      db.prepare("DELETE FROM persons WHERE id = ?").run(personId);
    }
    for (const commissionId of cleanupCommissions) {
      db.prepare("DELETE FROM commissions WHERE id = ?").run(commissionId);
    }
    cleanupDeliveries.length = 0;
    cleanupPersons.length = 0;
    cleanupCommissions.length = 0;
  });

  it("retrieves and saves enrollment delivery records", () => {
    db.prepare(
      "INSERT OR REPLACE INTO deliveries (assignment_id, enrollment_id, workflow_status, grade, ai_level, comments) VALUES (1, 1, 'WAITING_FOR_CORRECTION', 0, 0, 'No comments')",
    ).run();
    cleanupDeliveries.push({ assignmentId: 1, enrollmentId: 1 });

    const delivery = deliveryRepository.getOne(1, 1);
    expect(delivery).toBeTruthy();
    expect(delivery?.workflow_status).toBe("WAITING_FOR_CORRECTION");

    if (delivery) {
      deliveryRepository.save({
        ...delivery,
        grade: 8,
        ai_level: 1,
        comments: "Well done!",
        workflow_status: DeliveryWorkflowStatus.APPROVED,
      });

      const retrieved = deliveryRepository.getOne(1, 1);
      expect(retrieved?.grade).toBe(8);
      expect(retrieved?.ai_level).toBe(1);
      expect(retrieved?.comments).toBe("Well done!");
      expect(retrieved?.workflow_status).toBe("APPROVED");
    }

    const list = deliveryRepository.getAllByCommission(1);
    expect(list.length).toBeGreaterThan(0);
  });

  it("retrieves commission-level and cursada-level overview datasets", () => {
    const commOverview = deliveryRepository.getCommissionOverviewData(1);
    expect(commOverview.assignments).toHaveLength(2);
    expect(commOverview.grid).toHaveLength(4);
    expect(commOverview.grid[0]?.deliveries).toHaveLength(commOverview.assignments.length);

    const cursadaOverview = deliveryRepository.getSubjectPeriodOverviewData(
      SUBJECT_ALGEBRA,
      PERIOD_2025_1,
    );
    expect(cursadaOverview.assignments).toHaveLength(2);
    expect(cursadaOverview.grid).toHaveLength(8);
    expect(cursadaOverview.grid[0]?.deliveries).toHaveLength(
      cursadaOverview.assignments.length,
    );
  });

  it("does not leak enrollments of another subject sharing the period", () => {
    const overview = deliveryRepository.getSubjectPeriodOverviewData(
      SUBJECT_ALGEBRA,
      PERIOD_2025_1,
    );

    const cursadaIds = new Set(
      (
        db
          .prepare("SELECT DISTINCT subject_period_id FROM enrollments WHERE id IN (1,2,3,4,5,6,7,8)")
          .all() as { subject_period_id: number }[]
      ).map((row) => row.subject_period_id),
    );
    expect(cursadaIds.size).toBe(1);
    expect([...cursadaIds][0]).toBe(CURSADA_ALGEBRA);
    expect(overview.grid.map((row) => row.name)).toEqual([
      "Ana Martínez",
      "Carlos Gómez",
      "Juan Pérez",
      "Luis Fernández",
      "María Rodríguez",
      "Sofía López",
      "Tomás Benítez",
      "Valentina Ruiz",
    ]);
  });

  it("returns pending summary data and global stats", () => {
    const insertedCommissionId = db
      .prepare("INSERT INTO commissions (subject_id, period_id, name, slug) VALUES (?, ?, ?, ?)")
      .run(1, 1, "Comisión pendiente", "comision-pendiente").lastInsertRowid as number;
    cleanupCommissions.push(insertedCommissionId);

    const insertedPersonId = db
      .prepare("INSERT INTO persons (name, legajo) VALUES (?, ?)")
      .run("Alumno pendiente", "PENDING-001").lastInsertRowid as number;
    cleanupPersons.push(insertedPersonId);

    db.prepare(
      "INSERT INTO enrollments (person_id, subject_period_id, commission_id) VALUES (?, 9, ?)",
    ).run(insertedPersonId, insertedCommissionId);

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
    expect(stats.totalStudents).toBeGreaterThan(0);
  });

  it("uses default workflow status when saving a delivery without one", () => {
    const delivery = {
      assignment_id: 2,
      enrollment_id: 2,
      grade: 5,
      ai_level: 0,
      comments: "",
    } as any;

    deliveryRepository.save(delivery);

    const saved = deliveryRepository.getOne(2, 2);
    expect(saved?.workflow_status).toBe(DeliveryWorkflowStatus.NOT_DICTATED);
    cleanupDeliveries.push({ assignmentId: 2, enrollmentId: 2 });
  });
});
