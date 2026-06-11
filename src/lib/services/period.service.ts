import { apiFetch } from "../api";
import type { Period } from "../types";

export const periodService = {
  getAll: (subject_id?: number) => {
    const url = subject_id ? `/periods?subject_id=${subject_id}` : "/periods";
    return apiFetch<Period[]>(url);
  },
  create: (subject_id: number, year: number, semester: number) =>
    apiFetch<Period>("/periods", {
      method: "POST",
      body: JSON.stringify({ subject_id, year, semester }),
    }),
  update: (id: number, year: number, semester: number) =>
    apiFetch<Period>(`/periods/${id}`, {
      method: "PUT",
      body: JSON.stringify({ year, semester }),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/periods/${id}`, {
      method: "DELETE",
    }),
};
