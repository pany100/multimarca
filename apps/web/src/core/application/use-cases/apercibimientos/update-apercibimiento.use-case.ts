import { ApercibimientoRepository } from "@/core/domain/repositories/apercibimiento.repository";
import { UpdateApercibimientoData } from "@/core/infrastructure/validation/schemas/apercibimiento.schema";

export class UpdateApercibimientoUseCase {
  constructor(private readonly repository: ApercibimientoRepository) {}

  async execute(data: UpdateApercibimientoData) {
    return this.repository.update(data);
  }
}
