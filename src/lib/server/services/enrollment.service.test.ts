import { describe, it, expect, afterEach } from "vitest";
import { enrollmentService } from "./enrollment.service";
import db from "../database/db";

// Seeded fixtures: commission 1 belongs to cursada 1 (subject 1, period 2),
// commission 3 belongs to cursada 2 (subject 2, period 3).
const CURSADA_1 = 1;
const COMMISSION_1 = 1;
const CURSADA_2 = 2;

describe("enrollmentService.register", () => {
  const createdPersonIds: number[] = [];

  const track = (personIds: number[]) => {
    // Seeded persons are 1..32; only remove the ones this suite created.
    createdPersonIds.push(...personIds.filter((id) => id > 32));
  };

  afterEach(() => {
    for (const id of createdPersonIds) {
      db.prepare("DELETE FROM enrollments WHERE person_id = ?").run(id);
      db.prepare("DELETE FROM persons WHERE id = ?").run(id);
    }
    createdPersonIds.length = 0;
  });

  it("reports how many enrollments were created and how many reused an existing person", () => {
    const report = enrollmentService.register(
      CURSADA_1,
      [{ name: "Juan Pérez" }, { name: "Alumno Nuevo A" }, { name: "Alumno Nuevo B" }],
      COMMISSION_1,
    );
    track(report.enrollments.map((enrollment) => enrollment.person_id));

    expect(report.created).toBe(2);
    expect(report.reused).toBe(1);
    expect(report.enrollments).toHaveLength(3);
    expect(enrollmentService.getRoster(COMMISSION_1).map((row) => row.name)).toContain(
      "Alumno Nuevo A",
    );
  });

  it("reuses a person from another cursada when the legajo matches", () => {
    const report = enrollmentService.register(
      CURSADA_1,
      [{ name: "Nombre Que No Coincide", legajo: "MAT-001" }],
      COMMISSION_1,
    );
    track(report.enrollments.map((enrollment) => enrollment.person_id));

    expect(report.created).toBe(0);
    expect(report.reused).toBe(1);
    expect(report.enrollments[0].name).toBe("Nicolás Vega");
    expect(report.enrollments[0].subject_period_id).toBe(CURSADA_1);

    const fromOtherCursada = enrollmentService.getByCursada(CURSADA_2);
    expect(fromOtherCursada.map((row) => row.name)).toContain("Nicolás Vega");
  });

  it("reuses a person created earlier in the same batch", () => {
    const report = enrollmentService.register(
      CURSADA_1,
      [{ name: "Repetido En La Lista" }, { name: "Repetido En La Lista" }],
      COMMISSION_1,
    );
    track(report.enrollments.map((enrollment) => enrollment.person_id));

    expect(report.created).toBe(1);
    expect(report.reused).toBe(1);
  });

  it("assigns an already enrolled person to the commission instead of duplicating them", () => {
    const person = enrollmentService.register(CURSADA_1, [{ name: "Pendiente De Comisión" }], null);
    track(person.enrollments.map((enrollment) => enrollment.person_id));
    expect(person.enrollments[0].commission_id).toBeNull();

    const report = enrollmentService.register(
      CURSADA_1,
      [{ name: "Pendiente De Comisión" }],
      COMMISSION_1,
    );

    expect(report.created).toBe(0);
    expect(report.reused).toBe(1);
    expect(report.enrollments[0].commission_id).toBe(COMMISSION_1);
    expect(enrollmentService.getPending(CURSADA_1).map((row) => row.name)).not.toContain(
      "Pendiente De Comisión",
    );
  });

  it("ignores blank entries", () => {
    const report = enrollmentService.register(CURSADA_1, [{ name: "   " }], COMMISSION_1);

    expect(report.created).toBe(0);
    expect(report.reused).toBe(0);
    expect(report.enrollments).toHaveLength(0);
  });
});
