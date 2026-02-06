import { SueldoRepository } from "@/core/domain/repositories/sueldo.repository";

export class GetSueldoByIdUseCase {
  constructor(private readonly repository: SueldoRepository) {}

  async execute(id: number) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new Error("Sueldo no encontrado");
    }
    return item;
  }
}
