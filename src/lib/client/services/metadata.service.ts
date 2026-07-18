import { apiFetch } from "$lib/client/services/api";
import type { MetadataContextPayload } from "$lib/common/types";

export const metadataService = {
  getAcademicMetadata: async (fetchImpl: typeof fetch = fetch): Promise<MetadataContextPayload> =>
    apiFetch<MetadataContextPayload>("/metadata", undefined, fetchImpl),
};
