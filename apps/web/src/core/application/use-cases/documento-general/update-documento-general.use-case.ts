import { DocumentoGeneralRepository } from "@/core/domain/repositories/documento-general.repository";
import { UpdateDocumentoGeneralData } from "@/core/infrastructure/validation/schemas/documento-general.schema";

export class UpdateDocumentoGeneralUseCase {
  constructor(private readonly repository: DocumentoGeneralRepository) {}

  async execute(data: UpdateDocumentoGeneralData) {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Documento no encontrado");
    }
    return this.repository.update(data);
  }
}
