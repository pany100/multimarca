import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { trabajoSchema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { z } from "zod";

// DTO for total mano de obra calculation
export const totalManoDeObraSchema = z.object({
  trabajosRealizados: z.array(trabajoSchema),
});

export type TotalManoDeObraDto = z.infer<typeof totalManoDeObraSchema>;

export class GetTotalManoDeObraService {
  constructor() {}

  async getTotalManoDeObra(dto: TotalManoDeObraDto) {
    // Crear un comprobante calculado solo con los trabajos realizados
    const comprobanteCalculado = ComprobanteCalculadoFactory.fromPrecioDto({
      trabajosRealizados: dto.trabajosRealizados,
      reparacionesDeTercero: [],
      repuestosUsados: [],
      descuento: 0,
      incremento: 0,
      incrementoInterno: 0,
      porcentajeRecargo: 0,
    });

    return {
      totalManoDeObra: comprobanteCalculado.totalManoDeObra,
    };
  }
}
