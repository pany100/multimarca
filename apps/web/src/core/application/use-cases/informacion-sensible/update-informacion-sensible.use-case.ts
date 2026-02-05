import { InformacionSensibleRepository } from "@/core/domain/repositories/informacion-sensible.repository";
import { UpdateInformacionSensibleData } from "@/core/infrastructure/validation/schemas/informacion-sensible.schema";

export class UpdateInformacionSensibleUseCase {
  constructor(
    private readonly repository: InformacionSensibleRepository
  ) {}

  async execute(data: UpdateInformacionSensibleData) {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Información sensible no encontrada");
    }

    return this.repository.update(data);
  }
}
