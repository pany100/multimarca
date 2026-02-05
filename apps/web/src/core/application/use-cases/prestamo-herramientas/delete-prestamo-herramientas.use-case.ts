import { PrestamoHerramientasRepository } from "@/core/domain/repositories/prestamo-herramientas.repository";

export class DeletePrestamoHerramientasUseCase {
  constructor(
    private readonly repository: PrestamoHerramientasRepository
  ) {}

  async execute(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Préstamo de herramienta no encontrado");
    }

    return this.repository.delete(id);
  }
}
