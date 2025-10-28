import type { PerdidaRepository } from "@/core/domain/repositories/perdida.repository";
import type { RecuperacionRepository } from "@/core/domain/repositories/recuperacion.repository";

export interface CreateRecuperacionDto {
  perdidaId: number;
  fecha?: Date;
  monto: number;
  detalle?: string | null;
}

export class CreateRecuperacionUseCase {
  constructor(
    private readonly recuperacionRepo: RecuperacionRepository,
    private readonly perdidaRepo: PerdidaRepository
  ) {}

  async execute(input: CreateRecuperacionDto) {
    // Validate that the perdida exists
    const perdida = await this.perdidaRepo.findById(input.perdidaId);
    if (!perdida) {
      throw new Error("Registro de pérdida no encontrado");
    }

    const result = await this.recuperacionRepo.create({
      data: {
        data: {
          fecha: input.fecha || new Date(),
          monto: input.monto,
          detalle: input.detalle || null,
          perdidaId: input.perdidaId,
        },
      },
    });

    return result;
  }
}
