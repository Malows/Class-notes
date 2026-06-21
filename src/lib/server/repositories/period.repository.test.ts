import { describe, it, expect, afterEach } from "vitest";
import { periodRepository } from "./period.repository";
import db from "../db";

describe("periodRepository integration tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM periods WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("throws error when creating a duplicate active period", () => {
    const first = periodRepository.create(1, 2030, 1);
    createdIds.push(first.id);

    expect(() => {
      periodRepository.create(1, 2030, 1);
    }).toThrow("Period already exists for this subject");
  });

  it("throws error when updating a period to match another active period", () => {
    const p1 = periodRepository.create(1, 2031, 1);
    const p2 = periodRepository.create(1, 2031, 2);
    createdIds.push(p1.id, p2.id);

    expect(() => {
      periodRepository.update(p2.id, 2031, 1);
    }).toThrow("Period already exists for this subject");
  });

  it("retrieves all active periods for a subject and soft-deletes a period", () => {
    const first = periodRepository.create(1, 2035, 1);
    createdIds.push(first.id);

    const list = periodRepository.getAll(1);
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((p) => p.id === first.id)).toBe(true);

    periodRepository.delete(first.id);
    const updatedList = periodRepository.getAll(1);
    expect(updatedList.some((p) => p.id === first.id)).toBe(false);
  });
});
