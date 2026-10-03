import { afterEach, describe, expect, it } from "vitest";

import db from "../database/db";
import { commissionRepository } from "./commission.repository";

describe("commissionRepository integration tests", () => {
  const createdCommissionIds: number[] = [];
  const createdStudentIds: number[] = [];

  afterEach(() => {
    for (const id of createdStudentIds) {
      db.prepare("DELETE FROM students WHERE id = ?").run(id);
    }
    for (const id of createdCommissionIds) {
      db.prepare("DELETE FROM commissions WHERE id = ?").run(id);
    }
    createdStudentIds.length = 0;
    createdCommissionIds.length = 0;
  });

  it("creates commissions and lists them for a specific period", () => {
    const commission = commissionRepository.create(1, 1, "Comisión A");
    createdCommissionIds.push(commission.id);

    const allCommissions = commissionRepository.getAll();
    const filteredCommissions = commissionRepository.getAll(1);

    expect(commission.id).toBeGreaterThan(0);
    expect(commission.subject_id).toBe(1);
    expect(commission.period_id).toBe(1);
    expect(commission.name).toBe("Comisión A");
    expect(commission.student_count).toBe(0);
    expect(allCommissions.some((item) => item.id === commission.id)).toBe(true);
    expect(filteredCommissions.some((item) => item.id === commission.id)).toBe(true);
  });

  it("updates the commission name and student count", () => {
    const commission = commissionRepository.create(1, 1, "Comisión vieja");
    createdCommissionIds.push(commission.id);

    const student = db
      .prepare("INSERT INTO students (commission_id, name) VALUES (?, ?) RETURNING id")
      .get(commission.id, "Estudiante test") as { id: number };
    createdStudentIds.push(student.id);

    const updated = commissionRepository.update(commission.id, "Comisión nueva");

    expect(updated).toBeTruthy();
    expect(updated?.name).toBe("Comisión nueva");
    expect(updated?.student_count).toBe(1);
  });

  it("soft-deletes a commission", () => {
    const commission = commissionRepository.create(1, 2, "Comisión para borrar");
    createdCommissionIds.push(commission.id);

    commissionRepository.delete(commission.id);

    const allCommissions = commissionRepository.getAll();
    expect(allCommissions.some((item) => item.id === commission.id)).toBe(false);
  });

  it("returns undefined when updating a non-existing commission", () => {
    const updated = commissionRepository.update(999999, "No existe");

    expect(updated).toBeUndefined();
  });
});
