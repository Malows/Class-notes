import { describe, it, expect, vi, beforeEach } from "vitest";

import { apiFetch } from "$lib/client/services/api";
import { personService } from "./person.service";

vi.mock("$lib/client/services/api", () => ({
  apiFetch: vi.fn(),
}));

describe("personService", () => {
  beforeEach(() => {
    vi.mocked(apiFetch).mockReset();
  });

  it("list builds the registry query with pagination", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ items: [], total: 0, limit: 25, offset: 50 });

    await personService.list("perez", 25, 50);

    expect(apiFetch).toHaveBeenCalledWith("/persons?q=perez&limit=25&offset=50");
  });

  it("list defaults to the first page", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

    await personService.list();

    expect(apiFetch).toHaveBeenCalledWith("/persons?q=&limit=50&offset=0");
  });

  it("search returns only the items of the page", async () => {
    vi.mocked(apiFetch).mockResolvedValue({
      items: [{ id: 1, name: "Juan Pérez", legajo: "ING-001" }],
      total: 1,
      limit: 20,
      offset: 0,
    });

    const result = await personService.search("juan");

    expect(apiFetch).toHaveBeenCalledWith("/persons?q=juan&limit=20&offset=0");
    expect(result).toEqual([{ id: 1, name: "Juan Pérez", legajo: "ING-001" }]);
  });

  it("getById hits the person detail", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ person: {}, enrollments: [] });

    await personService.getById(7);

    expect(apiFetch).toHaveBeenCalledWith("/persons/7");
  });

  it("update sends a PUT with the legajo", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 7, name: "Nuevo", legajo: "L-1" });

    await personService.update(7, "Nuevo", "L-1");

    expect(apiFetch).toHaveBeenCalledWith("/persons/7", {
      method: "PUT",
      body: JSON.stringify({ name: "Nuevo", legajo: "L-1" }),
    });
  });

  it("create posts the new person", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 40, name: "Nuevo", legajo: "L-40" });

    await personService.create("Nuevo", "L-40");

    expect(apiFetch).toHaveBeenCalledWith("/persons", {
      method: "POST",
      body: JSON.stringify({ name: "Nuevo", legajo: "L-40" }),
    });
  });

  it("create sends a null legajo when omitted", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 41, name: "Sin Legajo", legajo: null });

    await personService.create("Sin Legajo");

    expect(apiFetch).toHaveBeenCalledWith("/persons", {
      method: "POST",
      body: JSON.stringify({ name: "Sin Legajo", legajo: null }),
    });
  });

  it("remove deletes the person", async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined);

    await personService.remove(7);

    expect(apiFetch).toHaveBeenCalledWith("/persons/7", { method: "DELETE" });
  });
});
