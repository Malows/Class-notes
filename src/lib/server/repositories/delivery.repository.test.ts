import { describe, it, expect, afterEach } from "vitest";
import { deliveryRepository } from "./delivery.repository";
import { DeliveryWorkflowStatus } from "$lib/types";
import db from "../db";

describe("deliveryRepository Integration Tests", () => {
  const cleanupDeliveries: { assignmentId: number; studentId: number }[] = [];

  afterEach(() => {
    for (const d of cleanupDeliveries) {
      db.prepare("DELETE FROM deliveries WHERE assignment_id = ? AND student_id = ?").run(
        d.assignmentId,
        d.studentId,
      );
    }
    cleanupDeliveries.length = 0;
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

  it("retrieves commission-level and subject-level overview datasets", () => {
    // commissionId 1 belongs to period 1, subject 1
    const commOverview = deliveryRepository.getCommissionOverviewData(1);
    expect(commOverview.assignments).toBeDefined();
    expect(commOverview.grid).toBeDefined();

    const subjOverview = deliveryRepository.getSubjectOverviewData(1);
    expect(subjOverview.assignments).toBeDefined();
    expect(subjOverview.grid).toBeDefined();
  });
});
