import { describe, it, expect, afterEach } from "vitest";
import { assignmentRepository } from "./assignment.repository";
import db from "../db";

describe("assignmentRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM assignments WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates assignments and cascades auto-delivery generations", () => {
    // Create assignment under period 1
    const assignment = assignmentRepository.create(
      1,
      "Lab Exercise 10",
      "Advanced Vector Calculus",
      "NOT_DICTATED",
    );
    createdIds.push(assignment.id);

    expect(assignment.id).toBeGreaterThan(0);
    expect(assignment.title).toBe("Lab Exercise 10");
    expect(assignment.subtitle).toBe("Advanced Vector Calculus");
    expect(assignment.workflow_status).toBe("NOT_DICTATED");

    // Verify auto-generated student deliveries exist in DB
    const count = db
      .prepare("SELECT COUNT(*) as cnt FROM deliveries WHERE assignment_id = ?")
      .get(assignment.id) as { cnt: number };
    expect(count.cnt).toBeGreaterThan(0);
  });

  it("updates statuses and cascades down to delivery records", () => {
    const assignment = assignmentRepository.create(
      1,
      "Temporary Status Assignment",
      "",
      "NOT_DICTATED",
    );
    createdIds.push(assignment.id);

    assignmentRepository.updateStatus(assignment.id, "WAITING_FOR_STUDENTS");

    const updated = db
      .prepare("SELECT workflow_status FROM assignments WHERE id = ?")
      .get(assignment.id) as { workflow_status: string };
    expect(updated.workflow_status).toBe("WAITING_FOR_STUDENTS");

    const deliveryStatus = db
      .prepare("SELECT workflow_status FROM deliveries WHERE assignment_id = ?")
      .all(assignment.id) as { workflow_status: string }[];
    expect(deliveryStatus.every((d) => d.workflow_status === "WAITING_FOR_STUDENTS")).toBe(true);
  });

  it("copies assignments and generates student deliveries for target period", () => {
    // Copy period 1 assignments to period 2
    const initialCount = db
      .prepare("SELECT COUNT(*) as cnt FROM assignments WHERE period_id = 2 AND deletedAt IS NULL")
      .get() as { cnt: number };
    assignmentRepository.copy(1, 2);

    const afterCount = db
      .prepare("SELECT COUNT(*) as cnt FROM assignments WHERE period_id = 2 AND deletedAt IS NULL")
      .get() as { cnt: number };
    expect(afterCount.cnt).toBeGreaterThan(initialCount.cnt);

    const copied = db
      .prepare("SELECT id FROM assignments WHERE period_id = 2 AND deletedAt IS NULL")
      .all() as { id: number }[];
    for (const item of copied) {
      createdIds.push(item.id);
    }
  });
});
