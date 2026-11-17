import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./+server";

const { getCursadaRosterMock } = vi.hoisted(() => ({ getCursadaRosterMock: vi.fn() }));

vi.mock("$lib/server/services/enrollment.service", () => ({
  enrollmentService: { getCursadaRoster: getCursadaRosterMock },
}));

const roster = {
  subject: {
    id: 1,
    name: "Álgebra Lineal",
    slug: "algebra-lineal",
    faculty_slug: "facultad-de-ingenieria",
  },
  period: { id: 2, year: 2025, semester: 1 },
  commissions: [{ id: 1, name: "Comisión Mañana", slug: "comision-manana" }],
  students: [
    {
      enrollment_id: 1,
      person_id: 1,
      name: "Juan Pérez",
      legajo: "ING-001",
      commission_id: 1,
      commission_name: "Comisión Mañana",
      commission_slug: "comision-manana",
    },
  ],
};

describe("cursada roster API", () => {
  beforeEach(() => {
    getCursadaRosterMock.mockReset();
  });

  it("returns the roster of a subject in a period", async () => {
    getCursadaRosterMock.mockReturnValue(roster);

    const response = await GET({ params: { id: "2", subjectId: "1" } } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(getCursadaRosterMock).toHaveBeenCalledWith(1, 2);
    expect(body.data.subject).toEqual(roster.subject);
    expect(body.data.period).toEqual(roster.period);
    expect(body.data.commissions).toEqual(roster.commissions);
    expect(body.data.students).toEqual(roster.students);
  });

  it("returns 404 when the subject is not linked to the period", async () => {
    getCursadaRosterMock.mockReturnValue(null);

    const response = await GET({ params: { id: "2", subjectId: "999" } } as any);

    expect(response.status).toBe(404);
  });

  it("rejects non-numeric ids", async () => {
    const response = await GET({ params: { id: "abc", subjectId: "1" } } as any);

    expect(response.status).toBe(400);
    expect(getCursadaRosterMock).not.toHaveBeenCalled();
  });
});
