import { DocumentoGeneralRepository } from "@/core/domain/repositories/documento-general.repository";

export class GetDocumentoGeneralUseCase {
  constructor(private readonly repository: DocumentoGeneralRepository) {}

  async execute(id: number) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new Error("Documento no encontrado");
    }
    return item;
  }
}
