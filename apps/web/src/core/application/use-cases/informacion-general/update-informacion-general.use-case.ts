import { InformacionGeneralRepository } from "@/core/domain/repositories/informacion-general.repository";
import { UpdateInformacionGeneralData } from "@/core/infrastructure/validation/schemas/informacion-general.schema";

export class UpdateInformacionGeneralUseCase {
  constructor(
    private readonly repository: InformacionGeneralRepository
  ) {}

  async execute(data: UpdateInformacionGeneralData) {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Información general no encontrada");
    }

    return this.repository.update(data);
  }
}
