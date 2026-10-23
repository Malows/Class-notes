import type { Delivery } from "$lib/common/types";

import { deliveryRepository } from "../repositories/delivery.repository";

export const deliveryService = {
  getAllByCommission: (commissionID: number): Delivery[] =>
    deliveryRepository.getAllByCommission(commissionID),
  getOne: (assignmentID: number, enrollmentID: number): Delivery | null =>
    deliveryRepository.getOne(assignmentID, enrollmentID),
  save: (delivery: Delivery): void => {
    deliveryRepository.save(delivery);
  },
  getCommissionOverviewData: (commissionID: number) =>
    deliveryRepository.getCommissionOverviewData(commissionID),
  getSubjectPeriodOverviewData: (subjectID: number, periodID: number) =>
    deliveryRepository.getSubjectPeriodOverviewData(subjectID, periodID),
  getPendingSummary: () => deliveryRepository.getPendingSummary(),
  getGlobalStats: () => deliveryRepository.getGlobalStats(),
};
