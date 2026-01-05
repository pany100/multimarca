import { CreateTareaAdministrativaDto } from "@/core/application/dto/tarea-administrativa.dto";
import { TareaAdministrativaRepository } from "@/core/domain/repositories/tarea-administrativa.repository";
import { TareaAdministrativa } from "@prisma/client";

export class CreateTareaAdministrativaUseCase {
  constructor(
    private readonly tareaAdministrativaRepository: TareaAdministrativaRepository
  ) {}

  async execute(
    dto: CreateTareaAdministrativaDto
  ): Promise<TareaAdministrativa> {
    return await this.tareaAdministrativaRepository.create({
      presupuestoId: dto.presupuestoId,
      usuarioId: dto.usuarioId,
      descripcion: dto.descripcion,
    });
  }
}
