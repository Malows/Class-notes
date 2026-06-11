import { apiFetch } from "../api";
import type { Subject } from "../types";

export const subjectService = {
  getAll: () => apiFetch<Subject[]>("/subjects"),
  create: (faculty_id: number, name: string) =>
    apiFetch<Subject>("/subjects", {
      method: "POST",
      body: JSON.stringify({ faculty_id, name }),
    }),
  update: (id: number, name: string) =>
    apiFetch<Subject>(`/subjects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/subjects/${id}`, {
      method: "DELETE",
    }),
};
