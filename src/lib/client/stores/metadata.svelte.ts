import { metadataService } from "$lib/client/services/metadata.service";
import type { MetadataContextPayload } from "$lib/common";

export class MetadataStore {
  context = $state<MetadataContextPayload | null>(null);
  loaded = $state(false);

  constructor(private service = metadataService) {}

  initializeStore(payload: MetadataContextPayload | null) {
    this.context = payload;
    this.loaded = true;
  }

  async fetchMetadataContext() {
    if (this.loaded) return;
    this.context = await this.service.getAcademicMetadata();
    this.loaded = true;
  }

  async refreshMetadata() {
    this.context = await this.service.getAcademicMetadata();
    this.loaded = true;
  }
}

export const metadataStore = new MetadataStore();
