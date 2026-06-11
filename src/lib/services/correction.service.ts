import { apiFetch } from "../api";
import type { Delivery } from "../types";

export const correctionService = {
  get: (commission_id: number) => apiFetch<Delivery[]>(`/correct?commission_id=${commission_id}`),
  getOne: (assignment_id: number, student_id: number) =>
    apiFetch<Delivery>(`/correct?assignment_id=${assignment_id}&student_id=${student_id}`),
  save: (delivery: Delivery) =>
    apiFetch<void>("/correct", {
      method: "POST",
      body: JSON.stringify(delivery),
    }),
};
