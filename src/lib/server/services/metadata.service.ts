import { periodRepository } from "$lib/server/repositories/period.repository";
import type { MetadataContextPayload } from "$lib/common";

export const metadataService = {
  getAcademicMetadata: async (): Promise<MetadataContextPayload> => {
    const now = new Date();
    return periodRepository.getActiveMetadata(now);
  },
};
