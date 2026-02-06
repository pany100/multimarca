import { SueldoRepository } from "@/core/domain/repositories/sueldo.repository";
import { UpdateSueldoData } from "@/core/infrastructure/validation/schemas/sueldo.schema";

export class UpdateSueldoUseCase {
  constructor(private readonly repository: SueldoRepository) {}

  async execute(data: UpdateSueldoData) {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Sueldo no encontrado");
    }
    return this.repository.update(data);
  }
}
