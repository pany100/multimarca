import { DeleteTareaAdministrativaDto } from "@/core/application/dto/tarea-administrativa.dto";
import { TareaAdministrativaRepository } from "@/core/domain/repositories/tarea-administrativa.repository";

export class DeleteTareaAdministrativaUseCase {
  constructor(
    private readonly tareaAdministrativaRepository: TareaAdministrativaRepository
  ) {}

  async execute(dto: DeleteTareaAdministrativaDto): Promise<void> {
    const tareaExistente = await this.tareaAdministrativaRepository.findById(
      dto.id
    );

    if (!tareaExistente) {
      throw new Error("Tarea administrativa no encontrada");
    }

    await this.tareaAdministrativaRepository.delete(dto.id);
  }
}
