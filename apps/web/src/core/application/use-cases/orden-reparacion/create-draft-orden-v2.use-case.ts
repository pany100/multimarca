import { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
import { createDraftOrdenSchema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { z } from "zod";

type CreateDraftOrdenDto = z.infer<typeof createDraftOrdenSchema>;

export class CreateDraftOrdenV2UseCase {
  constructor(private ordenRepository: OrdenReparacionRepository) {}

  async execute(dto: CreateDraftOrdenDto) {
    // Validaciones de negocio
    if (
      dto.kilometros !== undefined &&
      dto.kilometros !== null &&
      dto.kilometros < 0
    ) {
      throw new Error("Los kilómetros no pueden ser negativos");
    }

    // Crear la orden en estado Borrador
    const ordenData = {
      data: {
        autoId: dto.autoId,
        kilometros: dto.kilometros ?? null,
        observacionesCliente: dto.observacionesCliente,
        observacionesEntrada: "",
        observacionesSalida: "",
        estado: "Borrador" as any,
        descuento: 0,
        incremento: 0,
        incrementoInterno: 0,
        porcentajeRecargo: 0,
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
      },
    };

    const created = await this.ordenRepository.create(null, ordenData);

    return created;
  }
}
