import { PrestamoHerramientasRepository } from "@/core/domain/repositories/prestamo-herramientas.repository";
import { CreatePrestamoHerramientasData } from "@/core/infrastructure/validation/schemas/prestamo-herramientas.schema";

export class CreatePrestamoHerramientasUseCase {
  constructor(
    private readonly repository: PrestamoHerramientasRepository
  ) {}

  async execute(data: CreatePrestamoHerramientasData) {
    return this.repository.create(data);
  }
}
