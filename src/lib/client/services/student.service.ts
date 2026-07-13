import { apiFetch } from "$lib/client/api";
import { CreateStudentsSchema } from "../../common/schemas/dto.schema";
import type { Student } from "$lib/common";

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
