import type { MetadataContextPayload } from "$lib/common/types/metadata";

import { periodRepository } from "../repositories/period.repository";

export const metadataService = {
  getAcademicMetadata: async (): Promise<MetadataContextPayload> => {
    const now = new Date();
    return periodRepository.getActiveMetadata(now);
  },
};
