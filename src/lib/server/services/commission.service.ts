import type { Commission } from "$lib/common";

import { commissionRepository } from "../repositories/commission.repository";

export const commissionService = {
  getAll: (periodID?: number): Commission[] => commissionRepository.getAll(periodID),
  create: (period_id: number, name: string): Commission =>
    commissionRepository.create(period_id, name),
  update: (id: number, name: string): Commission => commissionRepository.update(id, name),
  delete: (id: number): void => {
    commissionRepository.delete(id);
  },
};
