import type { Delivery, DeliverySummary } from "$lib/common";

import { deliveryRepository } from "../repositories/delivery.repository";

export const deliveryService = {
  getAllByCommission: (commissionID: number): Delivery[] =>
    deliveryRepository.getAllByCommission(commissionID),
  getOne: (assignmentID: number, studentID: number): Delivery | undefined =>
    deliveryRepository.getOne(assignmentID, studentID),
  save: (delivery: Delivery): void => {
    deliveryRepository.save(delivery);
  },
  getCommissionOverviewData: (commissionID: number) =>
    deliveryRepository.getCommissionOverviewData(commissionID),
  getPeriodOverviewData: (periodID: number) => deliveryRepository.getPeriodOverviewData(periodID),
  getPendingSummary: (): DeliverySummary => deliveryRepository.getPendingSummary(),
  getGlobalStats: () => deliveryRepository.getGlobalStats(),
};
