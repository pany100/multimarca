import { SueldoRepository } from "@/core/domain/repositories/sueldo.repository";

export class DeleteSueldoUseCase {
  constructor(private readonly repository: SueldoRepository) {}

  async execute(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Sueldo no encontrado");
    }
    return this.repository.delete(id);
  }
}
