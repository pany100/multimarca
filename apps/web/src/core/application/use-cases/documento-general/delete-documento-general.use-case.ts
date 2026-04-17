import { DocumentoGeneralRepository } from "@/core/domain/repositories/documento-general.repository";

export class DeleteDocumentoGeneralUseCase {
  constructor(private readonly repository: DocumentoGeneralRepository) {}

  async execute(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Documento no encontrado");
    }
    return this.repository.delete(id);
  }
}
