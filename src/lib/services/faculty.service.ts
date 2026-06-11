import { apiFetch } from "../api";
import type { Faculty } from "../types";

export const facultyService = {
  getAll: () => apiFetch<Faculty[]>("/faculties"),
  create: (name: string) =>
    apiFetch<Faculty>("/faculties", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  update: (id: number, name: string) =>
    apiFetch<Faculty>(`/faculties/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/faculties/${id}`, {
      method: "DELETE",
    }),
};
