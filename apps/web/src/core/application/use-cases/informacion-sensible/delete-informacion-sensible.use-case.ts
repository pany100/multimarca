import { InformacionSensibleRepository } from "@/core/domain/repositories/informacion-sensible.repository";

export class DeleteInformacionSensibleUseCase {
  constructor(
    private readonly repository: InformacionSensibleRepository
  ) {}

  async execute(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Información sensible no encontrada");
    }

    return this.repository.delete(id);
  }
}
