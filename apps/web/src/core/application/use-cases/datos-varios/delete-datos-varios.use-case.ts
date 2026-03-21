import { DatosVariosRepository } from "@/core/domain/repositories/datos-varios.repository";

export class DeleteDatosVariosUseCase {
  constructor(private readonly repository: DatosVariosRepository) {}

  async execute(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Datos varios no encontrados");
    }

    return this.repository.delete(id);
  }
}
