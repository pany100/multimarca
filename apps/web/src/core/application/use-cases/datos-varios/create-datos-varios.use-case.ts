import { DatosVariosRepository } from "@/core/domain/repositories/datos-varios.repository";
import { CreateDatosVariosData } from "@/core/infrastructure/validation/schemas/datos-varios.schema";

export class CreateDatosVariosUseCase {
  constructor(private readonly repository: DatosVariosRepository) {}

  async execute(data: CreateDatosVariosData) {
    return this.repository.create(data);
  }
}
