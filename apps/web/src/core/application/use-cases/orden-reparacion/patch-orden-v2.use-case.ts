import { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
import { patchOrdenV2Schema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { z } from "zod";

type PatchOrdenV2Dto = z.infer<typeof patchOrdenV2Schema>;

export class PatchOrdenV2UseCase {
  constructor(private ordenRepository: OrdenReparacionRepository) {}

  async execute(dto: PatchOrdenV2Dto) {
    const ordenId = parseInt(dto.id);

    // Verificar que la orden existe
    const ordenExistente = await this.ordenRepository.findById(ordenId);
    if (!ordenExistente) {
      throw new Error("Orden de reparación no encontrada");
    }

    // Preparar datos para actualizar (solo los campos que vienen en el DTO)
    const dataToUpdate: any = {};

    if (dto.autoId !== undefined) {
      dataToUpdate.autoId = dto.autoId;
    }

    if (dto.kilometros !== undefined) {
      dataToUpdate.kilometros = dto.kilometros;
    }

    if (dto.observacionesCliente !== undefined) {
      dataToUpdate.observacionesCliente = dto.observacionesCliente;
    }

    if (dto.estado !== undefined) {
      dataToUpdate.estado = dto.estado;
    }

    if (dto.observacionesInternas !== undefined) {
      dataToUpdate.observacionesInternas = dto.observacionesInternas;
    }

    if (dto.observacionesSalida !== undefined) {
      dataToUpdate.observacionesSalida = dto.observacionesSalida;
    }

    if (dto.observacionesOcultas !== undefined) {
      dataToUpdate.observacionesOcultas = dto.observacionesOcultas;
    }

    // Validaciones de negocio
    if (dto.autoId !== undefined) {
      // Aquí podrías agregar validaciones adicionales, como verificar que el auto existe
      // Por ahora dejamos que Prisma maneje la foreign key constraint
    }

    if (
      dto.kilometros !== undefined &&
      dto.kilometros !== null &&
      dto.kilometros < 0
    ) {
      throw new Error("Los kilómetros no pueden ser negativos");
    }

    // Actualizar la orden
    const ordenActualizada = await this.ordenRepository.updatePartial(
      ordenId,
      dataToUpdate
    );

    return ordenActualizada;
  }
}
