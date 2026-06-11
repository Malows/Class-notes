import { apiFetch } from "../api";
import type { Assignment } from "../types";

export const assignmentService = {
  getAll: (period_id?: number) => {
    const url = period_id ? `/assignments?period_id=${period_id}` : "/assignments";
    return apiFetch<Assignment[]>(url);
  },
  create: (period_id: number, title: string) =>
    apiFetch<Assignment>("/assignments", {
      method: "POST",
      body: JSON.stringify({ period_id, title }),
    }),
  update: (id: number, title: string) =>
    apiFetch<Assignment>(`/assignments/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title }),
    }),
  copy: (source_period_id: number, target_period_id: number) =>
    apiFetch<void>("/assignments/copy", {
      method: "POST",
      body: JSON.stringify({ source_period_id, target_period_id }),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/assignments/${id}`, {
      method: "DELETE",
    }),
};
