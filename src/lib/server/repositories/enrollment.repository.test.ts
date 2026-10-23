import { describe, it, expect, afterEach } from "vitest";
import { CrossCursadaError, EnrollmentConflictError, enrollmentRepository } from "./enrollment.repository";
import { personRepository } from "./person.repository";
import db from "../database/db";

// Seeded fixtures: commission 1 belongs to cursada 1 (subject 1, period 2),
// commission 3 belongs to cursada 2 (subject 2, period 3).
const COMMISSION_1 = 1;
const COMMISSION_3 = 3;
const CURSADA_1 = 1;

describe("enrollmentRepository Integration Tests", () => {
  const createdPersonIds: number[] = [];

  const createPerson = (name: string, legajo?: string) => {
    const person = personRepository.create(name, legajo);
    createdPersonIds.push(person.id);
    return person;
  };

  afterEach(() => {
    for (const id of createdPersonIds) {
      db.prepare("DELETE FROM enrollments WHERE person_id = ?").run(id);
      db.prepare("DELETE FROM persons WHERE id = ?").run(id);
    }
    createdPersonIds.length = 0;
  });

  it("returns the roster of a commission ordered by person name", () => {
    const roster = enrollmentRepository.getRoster(COMMISSION_1);

    expect(roster).toHaveLength(4);
    expect(roster.map((row) => row.name)).toEqual([
      "Ana Martínez",
      "Carlos Gómez",
      "Juan Pérez",
      "María Rodríguez",
    ]);
    expect(roster.every((row) => row.commission_id === COMMISSION_1)).toBe(true);
  });

  it("lists enrollments without commission as pending and not in any roster", () => {
    const person = createPerson("Pendiente Sin Comisión", "PEND-001");
    const enrollment = enrollmentRepository.enroll(person.id, CURSADA_1);

    expect(enrollment.commission_id).toBeNull();
    expect(enrollmentRepository.getPending(CURSADA_1).map((row) => row.id)).toContain(
      enrollment.id,
    );
    expect(enrollmentRepository.getRoster(COMMISSION_1).map((row) => row.id)).not.toContain(
      enrollment.id,
    );
  });

  it("rejects a second enrollment for the same person and cursada", () => {
    const person = createPerson("Doble Inscripción", "PEND-002");
    enrollmentRepository.enroll(person.id, CURSADA_1);

    expect(() => enrollmentRepository.enroll(person.id, CURSADA_1)).toThrow(
      EnrollmentConflictError,
    );
  });

  it("allows re-enrolling a person after their enrollment was removed", () => {
    const person = createPerson("Reinscripto", "PEND-003");
    const first = enrollmentRepository.enroll(person.id, CURSADA_1);

    enrollmentRepository.remove(first.id);
    expect(enrollmentRepository.findById(first.id)).toBeNull();

    const second = enrollmentRepository.enroll(person.id, CURSADA_1);
    expect(second.id).not.toBe(first.id);
    expect(second.person_id).toBe(person.id);
  });

  it("rejects assigning a commission from another cursada", () => {
    const person = createPerson("Cursada Cruzada", "PEND-004");
    const enrollment = enrollmentRepository.enroll(person.id, CURSADA_1);

    expect(() => enrollmentRepository.assignCommission(enrollment.id, COMMISSION_3)).toThrow(
      CrossCursadaError,
    );
  });

  it("assigns and unassigns a commission inside the cursada", () => {
    const person = createPerson("Asignable", "PEND-005");
    const enrollment = enrollmentRepository.enroll(person.id, CURSADA_1);

    const assigned = enrollmentRepository.assignCommission(enrollment.id, COMMISSION_1);
    expect(assigned.commission_id).toBe(COMMISSION_1);
    expect(enrollmentRepository.getRoster(COMMISSION_1).map((row) => row.id)).toContain(
      enrollment.id,
    );

    const unassigned = enrollmentRepository.assignCommission(enrollment.id, null);
    expect(unassigned.commission_id).toBeNull();
    expect(enrollmentRepository.getRoster(COMMISSION_1).map((row) => row.id)).not.toContain(
      enrollment.id,
    );
  });

  it("drops a deleted person from the roster", () => {
    const person = createPerson("Persona Borrada", "PEND-006");
    enrollmentRepository.enroll(person.id, CURSADA_1, COMMISSION_1);
    expect(enrollmentRepository.getRoster(COMMISSION_1).map((row) => row.person_id)).toContain(
      person.id,
    );

    personRepository.delete(person.id);

    expect(enrollmentRepository.getRoster(COMMISSION_1).map((row) => row.person_id)).not.toContain(
      person.id,
    );
    expect(enrollmentRepository.getPending(CURSADA_1).map((row) => row.person_id)).not.toContain(
      person.id,
    );
  });

  it("drops a removed enrollment from the roster", () => {
    const person = createPerson("Inscripción Borrada", "PEND-007");
    const enrollment = enrollmentRepository.enroll(person.id, CURSADA_1, COMMISSION_1);

    enrollmentRepository.remove(enrollment.id);

    expect(enrollmentRepository.getRoster(COMMISSION_1).map((row) => row.id)).not.toContain(
      enrollment.id,
    );
  });

  it("returns the cursada roster with its subject, period and commissions", () => {
    const roster = enrollmentRepository.getCursadaRoster(CURSADA_1);

    expect(roster).not.toBeNull();
    expect(roster?.subject).toEqual({
      id: 1,
      name: "Álgebra Lineal",
      slug: "algebra-lineal",
      faculty_slug: "facultad-de-ingenieria",
    });
    expect(roster?.period).toEqual({ id: 2, year: 2025, semester: 1 });
    expect(roster?.commissions).toHaveLength(2);
    expect(roster?.commissions.map((c) => c.name)).toEqual([
      "Comisión Mañana",
      "Comisión Tarde",
    ]);
    expect(roster?.students).toHaveLength(8);
    expect(roster?.students[0]?.name).toBe("Ana Martínez");
    expect(roster?.students[0]?.commission_name).toBe("Comisión Mañana");
    expect(roster?.students[0]?.commission_slug).toBe("comision-manana");
  });

  it("includes students of the cursada without a commission", () => {
    const person = createPerson("Sin Comisión Roster", "ROSTER-001");
    const enrollment = enrollmentRepository.enroll(person.id, CURSADA_1);

    const roster = enrollmentRepository.getCursadaRoster(CURSADA_1);
    const row = roster?.students.find((student) => student.enrollment_id === enrollment.id);

    expect(row).toBeDefined();
    expect(row?.commission_id).toBeNull();
    expect(row?.commission_name).toBeNull();
    expect(row?.commission_slug).toBeNull();
  });

  it("excludes a deleted person from the cursada roster", () => {
    const person = createPerson("Persona Fuera Del Roster", "ROSTER-002");
    enrollmentRepository.enroll(person.id, CURSADA_1, COMMISSION_1);

    expect(
      enrollmentRepository
        .getCursadaRoster(CURSADA_1)
        ?.students.some((student) => student.person_id === person.id),
    ).toBe(true);

    personRepository.delete(person.id);

    expect(
      enrollmentRepository
        .getCursadaRoster(CURSADA_1)
        ?.students.some((student) => student.person_id === person.id),
    ).toBe(false);
  });

  it("returns null for an unknown cursada", () => {
    expect(enrollmentRepository.getCursadaRoster(999999)).toBeNull();
  });
});
