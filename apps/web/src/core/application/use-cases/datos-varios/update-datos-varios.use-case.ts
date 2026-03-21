import { DatosVariosRepository } from "@/core/domain/repositories/datos-varios.repository";
import { UpdateDatosVariosData } from "@/core/infrastructure/validation/schemas/datos-varios.schema";

export class UpdateDatosVariosUseCase {
  constructor(private readonly repository: DatosVariosRepository) {}

  async execute(data: UpdateDatosVariosData) {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Datos varios no encontrados");
    }

    return this.repository.update(data);
  }
}
