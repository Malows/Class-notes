import { describe, it, expect, afterEach } from "vitest";
import { LegajoConflictError, personRepository } from "./person.repository";
import db from "../database/db";

describe("personRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM enrollments WHERE person_id = ?").run(id);
      db.prepare("DELETE FROM persons WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates a person and finds it by id and legajo", () => {
    const person = personRepository.create("  Ana  Gómez ", " LEG-9001 ");
    createdIds.push(person.id);

    expect(person.name).toBe("Ana  Gómez");
    expect(person.legajo).toBe("LEG-9001");
    expect(personRepository.findById(person.id)).toEqual(person);
    expect(personRepository.findByLegajo("LEG-9001")).toEqual(person);
  });

  it("stores persons without a legajo", () => {
    const first = personRepository.create("Sin Legajo Uno");
    const second = personRepository.create("Sin Legajo Dos");
    createdIds.push(first.id, second.id);

    expect(first.legajo).toBeNull();
    expect(second.legajo).toBeNull();
  });

  it("rejects a duplicate legajo and creates nothing", () => {
    const original = personRepository.create("Original", "LEG-9002");
    createdIds.push(original.id);

    expect(() => personRepository.create("Duplicada", "LEG-9002")).toThrow(LegajoConflictError);
    expect(personRepository.search("Duplicada")).toHaveLength(0);
  });

  it("reuses a legajo after the person is soft deleted", () => {
    const original = personRepository.create("Borrable", "LEG-9003");
    createdIds.push(original.id);

    personRepository.delete(original.id);
    expect(personRepository.findById(original.id)).toBeNull();

    const replacement = personRepository.create("Nueva Persona", "LEG-9003");
    createdIds.push(replacement.id);

    expect(replacement.legajo).toBe("LEG-9003");
    expect(replacement.id).not.toBe(original.id);
  });

  it("soft deletes the person and their enrollments", () => {
    const person = personRepository.create("Con Inscripción", "LEG-9004");
    createdIds.push(person.id);
    db.prepare(
      "INSERT INTO enrollments (person_id, subject_period_id, commission_id) VALUES (?, 1, 1)",
    ).run(person.id);

    personRepository.delete(person.id);

    const enrollment = db
      .prepare("SELECT deletedAt FROM enrollments WHERE person_id = ?")
      .get(person.id) as { deletedAt: string | null };
    expect(enrollment.deletedAt).not.toBeNull();
  });

  it("searches persons by name and by legajo", () => {
    const person = personRepository.create("Búsqueda Única", "LEG-9005");
    createdIds.push(person.id);

    expect(personRepository.search("Búsqueda").map((p) => p.id)).toContain(person.id);
    expect(personRepository.search("LEG-9005").map((p) => p.id)).toContain(person.id);
    expect(personRepository.search("   ")).toHaveLength(0);
  });

  it("updates a person without colliding with another legajo", () => {
    const first = personRepository.create("Primera", "LEG-9006");
    const second = personRepository.create("Segunda", "LEG-9007");
    createdIds.push(first.id, second.id);

    expect(personRepository.update(first.id, "Primera Renombrada", "LEG-9006").name).toBe(
      "Primera Renombrada",
    );
    expect(() => personRepository.update(first.id, "Primera", "LEG-9007")).toThrow(
      LegajoConflictError,
    );
  });

  const addEnrollment = (
    personId: number,
    subjectPeriodId: number,
    commissionId: number | null,
  ) =>
    Number(
      db
        .prepare(
          "INSERT INTO enrollments (person_id, subject_period_id, commission_id) VALUES (?, ?, ?)",
        )
        .run(personId, subjectPeriodId, commissionId).lastInsertRowid,
    );

  it("lists the whole registry with an enrollment count per person", () => {
    const page = personRepository.list("", 100, 0);

    expect(page.total).toBe(32);
    expect(page.items).toHaveLength(32);
    expect(page.limit).toBe(100);
    expect(page.offset).toBe(0);
    expect(page.items.every((row) => row.enrollment_count === 1)).toBe(true);

    const juan = page.items.find((row) => row.name === "Juan Pérez");
    expect(juan?.legajo).toBe("ING-001");
    expect(juan?.last_subject_name).toBe("Álgebra Lineal");
    expect(juan?.last_period_year).toBe(2025);
    expect(juan?.last_period_semester).toBe(1);
  });

  it("keeps persons without enrollments in the list with a zero count", () => {
    const person = personRepository.create("Sin Cursadas", "LEG-9101");
    createdIds.push(person.id);

    const page = personRepository.list("Sin Cursadas");

    expect(page.total).toBe(1);
    expect(page.items[0]?.id).toBe(person.id);
    expect(page.items[0]?.enrollment_count).toBe(0);
    expect(page.items[0]?.last_subject_name).toBeNull();
    expect(page.items[0]?.last_period_year).toBeNull();
  });

  it("counts every active enrollment of a person and ignores deleted ones", () => {
    const person = personRepository.create("Con Dos Cursadas", "LEG-9102");
    createdIds.push(person.id);

    const first = addEnrollment(person.id, 1, 1);
    addEnrollment(person.id, 5, 7);

    let page = personRepository.list("Con Dos Cursadas");
    expect(page.items[0]?.enrollment_count).toBe(2);
    expect(page.items[0]?.last_subject_name).toBe("Cálculo Integral");

    db.prepare("UPDATE enrollments SET deletedAt = CURRENT_TIMESTAMP WHERE id = ?").run(first);
    page = personRepository.list("Con Dos Cursadas");
    expect(page.items[0]?.enrollment_count).toBe(1);
  });

  it("hides deleted persons from the list and from the total", () => {
    const person = personRepository.create("Se Va A Borrar", "LEG-9103");
    createdIds.push(person.id);

    expect(personRepository.list("Se Va A Borrar").total).toBe(1);
    personRepository.delete(person.id);

    const page = personRepository.list("Se Va A Borrar");
    expect(page.total).toBe(0);
    expect(page.items).toHaveLength(0);
  });

  it("orders by name and id so pagination never repeats a row", () => {
    const first = personRepository.create("Orden Repetido", "LEG-9104");
    const second = personRepository.create("Orden Repetido", "LEG-9105");
    createdIds.push(first.id, second.id);

    const pageOne = personRepository.list("Orden Repetido", 1, 0);
    const pageTwo = personRepository.list("Orden Repetido", 1, 1);

    expect(pageOne.total).toBe(2);
    expect(pageOne.items).toHaveLength(1);
    expect(pageTwo.items).toHaveLength(1);
    expect(pageOne.items[0]?.id).toBe(first.id);
    expect(pageTwo.items[0]?.id).toBe(second.id);
  });

  it("filters the registry by name fragment and by legajo fragment", () => {
    const person = personRepository.create("Filtro Registro", "LEG-9106");
    createdIds.push(person.id);

    expect(personRepository.list("Filtro Reg").items.map((row) => row.id)).toContain(person.id);
    expect(personRepository.list("LEG-9106").items.map((row) => row.id)).toContain(person.id);
    expect(personRepository.list("Nadie Con Este Nombre").total).toBe(0);
  });

  it("returns a person with their cursadas and navigation slugs", () => {
    const detail = personRepository.findWithEnrollments(1);

    expect(detail?.person.name).toBe("Juan Pérez");
    expect(detail?.enrollments).toHaveLength(1);
    expect(detail?.enrollments[0]).toMatchObject({
      subject_name: "Álgebra Lineal",
      subject_slug: "algebra-lineal",
      period_year: 2025,
      period_semester: 1,
      commission_name: "Comisión Mañana",
      commission_slug: "comision-manana",
      faculty_slug: "facultad-de-ingenieria",
    });
  });

  it("shows an unassigned cursada with null commission fields", () => {
    const person = personRepository.create("Sin Comisión", "LEG-9107");
    createdIds.push(person.id);
    addEnrollment(person.id, 1, null);

    const detail = personRepository.findWithEnrollments(person.id);

    expect(detail?.enrollments).toHaveLength(1);
    expect(detail?.enrollments[0]?.commission_id).toBeNull();
    expect(detail?.enrollments[0]?.commission_name).toBeNull();
    expect(detail?.enrollments[0]?.commission_slug).toBeNull();
  });

  it("orders cursadas from most recent to oldest", () => {
    const person = personRepository.create("Historial", "LEG-9108");
    createdIds.push(person.id);
    addEnrollment(person.id, 1, 1);
    addEnrollment(person.id, 5, 7);

    const detail = personRepository.findWithEnrollments(person.id);

    expect(detail?.enrollments.map((row) => row.subject_name)).toEqual([
      "Cálculo Integral",
      "Álgebra Lineal",
    ]);
  });

  it("returns null for an unknown or deleted person", () => {
    expect(personRepository.findWithEnrollments(999999)).toBeNull();

    const person = personRepository.create("Detalle Borrado", "LEG-9109");
    createdIds.push(person.id);
    personRepository.delete(person.id);

    expect(personRepository.findWithEnrollments(person.id)).toBeNull();
  });
});
