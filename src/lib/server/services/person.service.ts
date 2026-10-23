import type { Person, PersonDetail, PersonRegistryPage } from "$lib/common/types/enrollment";

import { personRepository } from "../repositories/person.repository";

export const personService = {
  create: (name: string, legajo?: string | null): Person => personRepository.create(name, legajo),
  findById: (id: number): Person | null => personRepository.findById(id),
  findByLegajo: (legajo: string): Person | null => personRepository.findByLegajo(legajo),
  search: (query: string, limit?: number): Person[] => personRepository.search(query, limit),
  list: (query: string, limit?: number, offset?: number): PersonRegistryPage =>
    personRepository.list(query, limit, offset),
  findWithEnrollments: (id: number): PersonDetail | null =>
    personRepository.findWithEnrollments(id),
  update: (id: number, name: string, legajo?: string | null): Person =>
    personRepository.update(id, name, legajo),
  delete: (id: number): void => personRepository.delete(id),
};
