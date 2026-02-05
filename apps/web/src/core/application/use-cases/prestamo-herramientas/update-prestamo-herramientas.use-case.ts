import { PrestamoHerramientasRepository } from "@/core/domain/repositories/prestamo-herramientas.repository";
import { UpdatePrestamoHerramientasData } from "@/core/infrastructure/validation/schemas/prestamo-herramientas.schema";

export class UpdatePrestamoHerramientasUseCase {
  constructor(
    private readonly repository: PrestamoHerramientasRepository
  ) {}

  async execute(data: UpdatePrestamoHerramientasData) {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Préstamo de herramienta no encontrado");
    }

    return this.repository.update(data);
  }
}
