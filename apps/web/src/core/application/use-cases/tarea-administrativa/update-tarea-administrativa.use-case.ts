import { UpdateTareaAdministrativaDto } from "@/core/application/dto/tarea-administrativa.dto";
import { TareaAdministrativaRepository } from "@/core/domain/repositories/tarea-administrativa.repository";
import { TareaAdministrativa } from "@prisma/client";

export class UpdateTareaAdministrativaUseCase {
  constructor(
    private readonly tareaAdministrativaRepository: TareaAdministrativaRepository
  ) {}

  async execute(
    dto: UpdateTareaAdministrativaDto
  ): Promise<TareaAdministrativa> {
    const tareaExistente = await this.tareaAdministrativaRepository.findById(
      dto.id
    );

    if (!tareaExistente) {
      throw new Error("Tarea administrativa no encontrada");
    }

    return await this.tareaAdministrativaRepository.update(dto.id, {
      usuarioId: dto.usuarioId,
      descripcion: dto.descripcion,
    });
  }
}
