import { apiFetch } from "$lib/client/services/api";
import type {
  Person,
  PersonDetail,
  PersonRegistryPage,
} from "$lib/common/types/enrollment";

const DEFAULT_SEARCH_LIMIT = 20;

export const personService = {
  list: (query = "", limit = 50, offset = 0) => {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
      offset: String(offset),
    });

    return apiFetch<PersonRegistryPage>(`/persons?${params.toString()}`);
  },
  search: async (query: string, limit = DEFAULT_SEARCH_LIMIT): Promise<Person[]> => {
    const page = await personService.list(query, limit, 0);
    return page.items;
  },
  getById: (id: number) => apiFetch<PersonDetail>(`/persons/${id}`),
  create: (name: string, legajo?: string | null) =>
    apiFetch<Person>("/persons", {
      method: "POST",
      body: JSON.stringify({ name, legajo: legajo ?? null }),
    }),
  remove: (id: number) =>
    apiFetch<void>(`/persons/${id}`, {
      method: "DELETE",
    }),
  update: (id: number, name: string, legajo?: string | null) =>
    apiFetch<Person>(`/persons/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, legajo: legajo ?? null }),
    }),
};
