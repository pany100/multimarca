import { ApercibimientoRepository } from "@/core/domain/repositories/apercibimiento.repository";
import { CreateApercibimientoData } from "@/core/infrastructure/validation/schemas/apercibimiento.schema";

export class CreateApercibimientoUseCase {
  constructor(private readonly repository: ApercibimientoRepository) {}

  async execute(data: CreateApercibimientoData) {
    return this.repository.create(data);
  }
}
