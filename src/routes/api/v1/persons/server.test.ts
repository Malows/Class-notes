import { beforeEach, describe, expect, it, vi } from "vitest";

import { GET, POST } from "./+server";

const { listMock, createMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  createMock: vi.fn(),
}));

vi.mock("$lib/server/services/person.service", () => ({
  personService: { list: listMock, create: createMock },
}));

const page = { items: [], total: 0, limit: 50, offset: 0 };

const postRequest = (payload: unknown) =>
  new Request("http://localhost/api/v1/persons", {
    method: "POST",
    body: JSON.stringify(payload),
  });

describe("persons collection API", () => {
  beforeEach(() => {
    listMock.mockReset();
    createMock.mockReset();
    listMock.mockReturnValue(page);
  });

  it("lists the registry with the default page size", async () => {
    const response = await GET({ url: new URL("http://localhost/api/v1/persons") } as any);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(listMock).toHaveBeenCalledWith("", 50, 0);
    expect(body.data).toEqual(page);
  });

  it("passes the query through to the service", async () => {
    await GET({ url: new URL("http://localhost/api/v1/persons?q=perez&limit=10&offset=20") } as any);

    expect(listMock).toHaveBeenCalledWith("perez", 10, 20);
  });

  it("clamps the page size to the maximum", async () => {
    await GET({ url: new URL("http://localhost/api/v1/persons?limit=999") } as any);

    expect(listMock).toHaveBeenCalledWith("", 200, 0);
  });

  it("falls back to safe defaults for invalid pagination", async () => {
    await GET({ url: new URL("http://localhost/api/v1/persons?limit=abc&offset=-3") } as any);

    expect(listMock).toHaveBeenCalledWith("", 50, 0);
  });

  it("creates a person", async () => {
    createMock.mockReturnValue({ id: 40, name: "Nuevo Alumno", legajo: "LEG-40" });

    const response = await POST({
      request: postRequest({ name: "Nuevo Alumno", legajo: "LEG-40" }),
    } as any);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(createMock).toHaveBeenCalledWith("Nuevo Alumno", "LEG-40");
    expect(body.data.id).toBe(40);
  });

  it("rejects a creation without a name", async () => {
    const response = await POST({ request: postRequest({ name: "   " }) } as any);

    expect(response.status).toBe(400);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("maps a legajo conflict to 409", async () => {
    const { LegajoConflictError } = await import(
      "$lib/server/repositories/person.repository"
    );
    createMock.mockImplementation(() => {
      throw new LegajoConflictError("ING-001");
    });

    const response = await POST({ request: postRequest({ name: "Duplicado", legajo: "ING-001" }) } as any);

    expect(response.status).toBe(409);
  });
});
