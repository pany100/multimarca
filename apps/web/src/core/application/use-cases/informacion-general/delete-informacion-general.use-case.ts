import { InformacionGeneralRepository } from "@/core/domain/repositories/informacion-general.repository";

export class DeleteInformacionGeneralUseCase {
  constructor(
    private readonly repository: InformacionGeneralRepository
  ) {}

  async execute(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Información general no encontrada");
    }

    return this.repository.delete(id);
  }
}
