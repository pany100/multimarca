import { z } from "zod";

export const listRecordatoriosQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(200).default(10),
  query: z.string().optional().default(""),
  estado: z.enum(["pendiente", "enviado"]).optional(),
});

export type ListRecordatoriosQueryDto = z.infer<
  typeof listRecordatoriosQuerySchema
>;
