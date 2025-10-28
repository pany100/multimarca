import type { RecuperacionRepository } from "@/core/domain/repositories/recuperacion.repository";

export interface UpdateRecuperacionDto {
  id: number;
  recuperacionId: number;
  fecha?: Date;
  monto: number;
  detalle?: string | null;
}

export class UpdateRecuperacionUseCase {
  constructor(private readonly repo: RecuperacionRepository) {}

  async execute(input: UpdateRecuperacionDto) {
    // Check if recuperacion exists and belongs to the correct perdida
    const existingRecuperacion = await this.repo.findById(input.recuperacionId);
    if (!existingRecuperacion || existingRecuperacion.perdidaId !== input.id) {
      throw new Error("Recuperación no encontrada");
    }

    const result = await this.repo.update({
      data: {
        where: { id: input.recuperacionId },
        data: {
          fecha: input.fecha || existingRecuperacion.fecha,
          monto: input.monto,
          detalle: input.detalle !== undefined ? input.detalle : existingRecuperacion.detalle,
        },
      },
    });

    return result;
  }
}
