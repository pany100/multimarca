import { ApercibimientoRepository } from "@/core/domain/repositories/apercibimiento.repository";

export class GetApercibimientoUseCase {
  constructor(private readonly repository: ApercibimientoRepository) {}

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
