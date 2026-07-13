export type MetadataTerm = "Cuatrimestre I" | "Cuatrimestre II";

export interface MetadataContextPayload {
  periodData: {
    year: number;
    term: MetadataTerm;
  } | null;
  subjects: Array<{
    id: string;
    name: string;
    href: string;
  }>;
}
