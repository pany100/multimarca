import { getOrdenesQuerySchema } from "@/core/infrastructure/validation/schemas/cliente.schema";
import { z } from "zod";

export type GetOrdenesDto = z.infer<typeof getOrdenesQuerySchema>;
