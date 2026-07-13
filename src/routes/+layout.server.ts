import { metadataService } from "$lib/server/services/metadata.service";

export const load = async () => {
  const metadata = await metadataService.getAcademicMetadata();
  return { metadata };
};
