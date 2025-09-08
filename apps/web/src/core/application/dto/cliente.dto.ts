import {
  getOrdenesQuerySchema,
  listDeudoresQuerySchema,
} from "@/core/infrastructure/validation/schemas/cliente.schema";
import { z } from "zod";

export type GetOrdenesDto = z.infer<typeof getOrdenesQuerySchema>;
export type ListDeudoresDto = z.infer<typeof listDeudoresQuerySchema>;
