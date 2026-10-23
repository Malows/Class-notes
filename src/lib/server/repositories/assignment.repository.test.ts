import { describe, it, expect, afterEach } from "vitest";
import { assignmentRepository } from "./assignment.repository";
import db from "../database/db";

// Seeded fixtures: cursada 1 (Álgebra Lineal, 2025-1) holds commissions 1 and 2
// with 8 enrollments. Cursada 5 (Cálculo Integral, 2025-1) shares the same period
// and holds 4 enrollments in commissions 7 and 8.
const CURSADA_ALGEBRA = 1;
const CURSADA_CALCULO_INTEGRAL = 5;

describe("assignmentRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM assignments WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates assignments and generates one delivery per enrollment of the cursada", () => {
    const assignment = assignmentRepository.create(
      CURSADA_ALGEBRA,
      "Lab Exercise 10",
      "Advanced Vector Calculus",
      "NOT_DICTATED",
    );
    createdIds.push(assignment.id);

    expect(assignment.id).toBeGreaterThan(0);
    expect(assignment.subject_period_id).toBe(CURSADA_ALGEBRA);
    expect(assignment.title).toBe("Lab Exercise 10");
    expect(assignment.subtitle).toBe("Advanced Vector Calculus");
    expect(assignment.workflow_status).toBe("NOT_DICTATED");

    const count = db
      .prepare("SELECT COUNT(*) as cnt FROM deliveries WHERE assignment_id = ?")
      .get(assignment.id) as { cnt: number };
    expect(count.cnt).toBe(8);
  });

  it("creates no deliveries for another subject sharing the same period", () => {
    const assignment = assignmentRepository.create(CURSADA_ALGEBRA, "TP Aislado", "", "NOT_DICTATED");
    createdIds.push(assignment.id);

    const leaked = db
      .prepare(
        `SELECT COUNT(*) as cnt
           FROM deliveries d
           JOIN enrollments e ON e.id = d.enrollment_id
          WHERE d.assignment_id = ? AND e.subject_period_id <> ?`,
      )
      .get(assignment.id, CURSADA_ALGEBRA) as { cnt: number };

    const otherCursada = db
      .prepare(
        `SELECT COUNT(*) as cnt
           FROM deliveries d
           JOIN enrollments e ON e.id = d.enrollment_id
          WHERE d.assignment_id = ? AND e.subject_period_id = ?`,
      )
      .get(assignment.id, CURSADA_CALCULO_INTEGRAL) as { cnt: number };

    expect(leaked.cnt).toBe(0);
    expect(otherCursada.cnt).toBe(0);
  });

  it("updates statuses and cascades down to delivery records", () => {
    const assignment = assignmentRepository.create(
      CURSADA_ALGEBRA,
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

  it("updates assignment fields and deletes it softly", () => {
    const assignment = assignmentRepository.create(
      CURSADA_ALGEBRA,
      "Temporary Assignment",
      "Subtitle",
      "NOT_DICTATED",
    );
    createdIds.push(assignment.id);

    const updated = assignmentRepository.update(
      assignment.id,
      "Updated title",
      "Updated subtitle",
      "WAITING_FOR_STUDENTS",
    );

    expect(updated.title).toBe("Updated title");
    expect(updated.subtitle).toBe("Updated subtitle");
    expect(updated.workflow_status).toBe("WAITING_FOR_STUDENTS");

    assignmentRepository.delete(assignment.id);
    const remaining = db
      .prepare("SELECT id FROM assignments WHERE id = ? AND deletedAt IS NULL")
      .get(assignment.id) as { id: number } | undefined;
    expect(remaining).toBeUndefined();
  });

  it("copies assignments between cursadas and generates deliveries for the target cursada", () => {
    const source = assignmentRepository.create(CURSADA_ALGEBRA, "TP Para Copiar", "", "NOT_DICTATED");
    createdIds.push(source.id);

    const before = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM assignments WHERE subject_period_id = ? AND deletedAt IS NULL",
      )
      .get(CURSADA_CALCULO_INTEGRAL) as { cnt: number };

    assignmentRepository.copy(CURSADA_ALGEBRA, CURSADA_CALCULO_INTEGRAL);

    const after = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM assignments WHERE subject_period_id = ? AND deletedAt IS NULL",
      )
      .get(CURSADA_CALCULO_INTEGRAL) as { cnt: number };
    expect(after.cnt).toBeGreaterThan(before.cnt);

    const copied = db
      .prepare(
        "SELECT id FROM assignments WHERE subject_period_id = ? AND deletedAt IS NULL",
      )
      .all(CURSADA_CALCULO_INTEGRAL) as { id: number }[];
    for (const item of copied) {
      // Seeded assignments are 1..8; only remove the ones this suite created.
      if (item.id > 8) {
        createdIds.push(item.id);
      }
    }

    const leaked = db
      .prepare(
        `SELECT COUNT(*) as cnt
           FROM deliveries d
           JOIN enrollments e ON e.id = d.enrollment_id
          WHERE d.assignment_id IN (${copied.map(() => "?").join(",") || "NULL"})
            AND e.subject_period_id <> ?`,
      )
      .get(...copied.map((item) => item.id), CURSADA_CALCULO_INTEGRAL) as { cnt: number };
    expect(leaked.cnt).toBe(0);
  });
});
