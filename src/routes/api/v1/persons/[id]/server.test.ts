import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, GET } from "./+server";

const { findWithEnrollmentsMock, findByIdMock, deleteMock } = vi.hoisted(() => ({
  findWithEnrollmentsMock: vi.fn(),
  findByIdMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("$lib/server/services/person.service", () => ({
  personService: {
    findWithEnrollments: findWithEnrollmentsMock,
    findById: findByIdMock,
    delete: deleteMock,
  },
}));

describe("person detail API", () => {
  beforeEach(() => {
    findWithEnrollmentsMock.mockReset();
    findByIdMock.mockReset();
    deleteMock.mockReset();
  });

  it("rejects an invalid id", async () => {
    const response = await GET({ params: { id: "abc" } } as any);

    expect(response.status).toBe(400);
    expect(findWithEnrollmentsMock).not.toHaveBeenCalled();
  });

  it("returns 404 for an unknown person", async () => {
    findWithEnrollmentsMock.mockReturnValue(null);

    const response = await GET({ params: { id: "999" } } as any);

    expect(response.status).toBe(404);
  });

  it("returns the person with their cursadas", async () => {
    findWithEnrollmentsMock.mockReturnValue({
      person: { id: 1, name: "Juan Pérez", legajo: "ING-001" },
      enrollments: [
        {
          id: 1,
          subject_period_id: 1,
          commission_id: 1,
          subject_name: "Álgebra Lineal",
          subject_slug: "algebra-lineal",
          period_year: 2025,
          period_semester: 1,
          commission_name: "Comisión Mañana",
          commission_slug: "comision-manana",
          faculty_slug: "facultad-de-ingenieria",
          faculty_name: "Facultad de Ingeniería",
        },
      ],
    });

    const response = await GET({ params: { id: "1" } } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(findWithEnrollmentsMock).toHaveBeenCalledWith(1);
    expect(body.data.person.name).toBe("Juan Pérez");
    expect(body.data.enrollments).toHaveLength(1);
  });

  it("deletes a person", async () => {
    findByIdMock.mockReturnValue({ id: 1, name: "Juan Pérez", legajo: "ING-001" });

    const response = await DELETE({ params: { id: "1" } } as any);

    expect(response.status).toBe(204);
    expect(deleteMock).toHaveBeenCalledWith(1);
  });

  it("returns 404 when deleting an unknown person", async () => {
    findByIdMock.mockReturnValue(null);

    const response = await DELETE({ params: { id: "999" } } as any);

    expect(response.status).toBe(404);
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("rejects deleting with an invalid id", async () => {
    const response = await DELETE({ params: { id: "abc" } } as any);

    expect(response.status).toBe(400);
    expect(deleteMock).not.toHaveBeenCalled();
  });
});
