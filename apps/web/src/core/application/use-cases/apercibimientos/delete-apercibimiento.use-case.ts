import { ApercibimientoRepository } from "@/core/domain/repositories/apercibimiento.repository";

export class DeleteApercibimientoUseCase {
  constructor(private readonly repository: ApercibimientoRepository) {}

  async execute(id: number) {
    return this.repository.delete(id);
  }
}
