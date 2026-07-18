import { z } from "zod";

export const MetadataDtoSchema = z.object({
  periodData: z
    .object({
      year: z.number(),
      term: z.enum(["Cuatrimestre I", "Cuatrimestre II"]),
    })
    .nullable(),
  subjects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      href: z.string(),
    }),
  ),
});
