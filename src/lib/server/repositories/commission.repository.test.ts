import { afterEach, describe, expect, it } from "vitest";

import db from "../database/db";
import { commissionRepository } from "./commission.repository";

describe("commissionRepository integration tests", () => {
  const createdCommissionIds: number[] = [];
  const createdPersonIds: number[] = [];

  afterEach(() => {
    for (const id of createdPersonIds) {
      db.prepare("DELETE FROM enrollments WHERE person_id = ?").run(id);
      db.prepare("DELETE FROM persons WHERE id = ?").run(id);
    }
    for (const id of createdCommissionIds) {
      db.prepare("DELETE FROM commissions WHERE id = ?").run(id);
    }
    createdPersonIds.length = 0;
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
    expect(commission.slug).toBe("comision-a");
    expect(commission.student_count).toBe(0);
    expect(allCommissions.some((item) => item.id === commission.id)).toBe(true);
    expect(filteredCommissions.some((item) => item.id === commission.id)).toBe(true);
  });

  it("appends a numeric suffix for a slug collision within the same subject and period", () => {
    const first = commissionRepository.create(1, 1, "Comisión Mañana");
    const second = commissionRepository.create(1, 1, "Comisión Mañana");
    createdCommissionIds.push(first.id, second.id);

    expect(first.slug).toBe("comision-manana");
    expect(second.slug).toBe("comision-manana-2");
  });

  it("reuses the slug of a soft-deleted commission in the same scope", () => {
    const first = commissionRepository.create(1, 1, "Comisión Reuso");
    createdCommissionIds.push(first.id);
    commissionRepository.delete(first.id);

    const second = commissionRepository.create(1, 1, "Comisión Reuso");
    createdCommissionIds.push(second.id);

    expect(second.slug).toBe("comision-reuso");
  });

  it("regenerates the slug on rename and keeps it when the name is unchanged", () => {
    const commission = commissionRepository.create(1, 1, "Comisión Inicial");
    createdCommissionIds.push(commission.id);

    const renamed = commissionRepository.update(commission.id, "Comisión Renombrada");
    expect(renamed.slug).toBe("comision-renombrada");

    const untouched = commissionRepository.update(commission.id, "Comisión Renombrada");
    expect(untouched.slug).toBe("comision-renombrada");
  });

  it("updates the commission name and student count", () => {
    const commission = commissionRepository.create(1, 1, "Comisión vieja");
    createdCommissionIds.push(commission.id);

    const personId = db
      .prepare("INSERT INTO persons (name) VALUES (?) RETURNING id")
      .get("Estudiante test") as { id: number };
    createdPersonIds.push(personId.id);
    db.prepare("INSERT INTO enrollments (person_id, subject_period_id, commission_id) VALUES (?, 9, ?)").run(
      personId.id,
      commission.id,
    );

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
