import { apiFetch } from "$lib/client/services/api";
import type { Subject } from "$lib/common/types/academic";

export const subjectService = {
  getAll: () => apiFetch<Subject[]>("/subjects"),
  getByPeriod: (periodId: number) => apiFetch<Subject[]>(`/periods/${periodId}/subjects`),
  syncByPeriod: (periodId: number, subjectIds: number[]) =>
    apiFetch<Subject[]>(`/periods/${periodId}/subjects`, {
      method: "PUT",
      body: JSON.stringify({ subject_ids: subjectIds }),
    }),
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
