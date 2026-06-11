import { apiFetch } from "../api";
import type { Student } from "../types";
import { CreateStudentsSchema } from "../schemas/dto.schema";

export const studentService = {
  getAll: (commission_id?: number) => {
    let url = "/students";
    if (commission_id) url += `?commission_id=${commission_id}`;
    return apiFetch<Student[]>(url);
  },
  create: (commission_id: number, names: string[]) => {
    const validated = CreateStudentsSchema.parse({ commission_id, names });
    return apiFetch<void>("/students", {
      method: "POST",
      body: JSON.stringify(validated),
    });
  },
  update: (id: number, name: string) =>
    apiFetch<Student>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    }),
  delete: (id: number) =>
    apiFetch<void>(`/students/${id}`, {
      method: "DELETE",
    }),
};
