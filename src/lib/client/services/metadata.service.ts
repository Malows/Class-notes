import { apiFetch } from "$lib/client/api";
import type { MetadataContextPayload } from "$lib/common";

export const metadataService = {
  getAcademicMetadata: async (fetchImpl: typeof fetch = fetch): Promise<MetadataContextPayload> =>
    apiFetch<MetadataContextPayload>("/metadata", undefined, fetchImpl),
};
