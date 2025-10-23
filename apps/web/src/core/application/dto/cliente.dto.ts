import {
  getClienteQuerySchema,
  getOrdenesQuerySchema,
  listAcreedoresQuerySchema,
  listDeudoresQuerySchema,
} from "@/core/infrastructure/validation/schemas/cliente.schema";
import { z } from "zod";

export type GetOrdenesDto = z.infer<typeof getOrdenesQuerySchema>;
export type ListDeudoresDto = z.infer<typeof listDeudoresQuerySchema>;
export type ListAcreedoresDto = z.infer<typeof listAcreedoresQuerySchema>;
export type GetClienteDto = z.infer<typeof getClienteQuerySchema>;
