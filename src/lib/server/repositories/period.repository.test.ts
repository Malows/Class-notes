import { afterEach, describe, expect, it } from "vitest";
import { periodRepository } from "./period.repository";
import db from "../database/db";

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

    const list = periodRepository.getAll();
    expect(list.length).toBeGreaterThan(0);
    expect(list.some((p) => p.id === first.id)).toBe(true);

    periodRepository.delete(first.id);
    const updatedList = periodRepository.getAll();
    expect(updatedList.some((p) => p.id === first.id)).toBe(false);
  });

  it("retrieves periods sorted in descending order by year and semester", () => {
    const p1 = periodRepository.create(1, 2038, 1);
    const p2 = periodRepository.create(1, 2039, 2);
    const p3 = periodRepository.create(1, 2039, 1);
    createdIds.push(p1.id, p2.id, p3.id);

    const list = periodRepository.getAll();

    const relative = list.filter((p) => [p1.id, p2.id, p3.id].includes(p.id));

    expect(relative[0].id).toBe(p2.id);
    expect(relative[1].id).toBe(p3.id);
    expect(relative[2].id).toBe(p1.id);
  });

  it("returns each seeded period once in the general listing", () => {
    const list = periodRepository.getAll();
    const seededPeriods = list.filter((period) => [1, 2, 3, 4].includes(period.id));

    expect(seededPeriods).toHaveLength(4);
    expect(new Set(seededPeriods.map((period) => period.id)).size).toBe(4);
  });

  it("returns the full period set for a subject when that subject is linked to all seeded periods", () => {
    const list = periodRepository.getAllBySubject(1);
    const seededPeriods = list.filter((period) => [1, 2, 3, 4].includes(period.id));

    expect(seededPeriods).toHaveLength(4);
    expect(seededPeriods.map((period) => period.id)).toEqual(expect.arrayContaining([1, 2, 3, 4]));
  });

  it("returns active metadata for the current year and semester window", () => {
    const subjectStmt = db.prepare("INSERT INTO subjects (id, faculty_id, name) VALUES (?, ?, ?)");
    subjectStmt.run(99, 1, "Materia Metadata");
    const period = periodRepository.create(99, 2026, 1);
    createdIds.push(period.id);

    const metadata = periodRepository.getActiveMetadata(new Date("2026-01-15T12:00:00.000Z"));

    expect(metadata.periodData).toEqual({ year: 2026, term: "Cuatrimestre I" });
    expect(metadata.subjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "99",
          name: "Materia Metadata",
          href: "/faculties/1/subjects/99/periods",
        }),
      ]),
    );
  });

  it("returns empty metadata when no period matches the current year and semester", () => {
    const metadata = periodRepository.getActiveMetadata(new Date("2025-10-15T12:00:00.000Z"));

    expect(metadata.periodData).toBeNull();
    expect(metadata.subjects).toEqual([]);
  });

  it("updates a period with a linked subject and preserves the relationship", () => {
    const period = periodRepository.create(1, 2040, 2);
    createdIds.push(period.id);

    const updated = periodRepository.update(period.id, 2041, 1);

    expect(updated.year).toBe(2041);
    expect(updated.semester).toBe(1);
    expect(updated.subject_id).toBe(1);
    expect(updated.subject_name).toBe("Álgebra Lineal");
  });
});
