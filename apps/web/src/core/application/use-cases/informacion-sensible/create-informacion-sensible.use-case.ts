import { InformacionSensibleRepository } from "@/core/domain/repositories/informacion-sensible.repository";
import { CreateInformacionSensibleData } from "@/core/infrastructure/validation/schemas/informacion-sensible.schema";

export class CreateInformacionSensibleUseCase {
  constructor(
    private readonly repository: InformacionSensibleRepository
  ) {}

  async execute(data: CreateInformacionSensibleData) {
    return this.repository.create(data);
  }
}
