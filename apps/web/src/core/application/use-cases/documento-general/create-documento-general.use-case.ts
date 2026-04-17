import { DocumentoGeneralRepository } from "@/core/domain/repositories/documento-general.repository";
import { CreateDocumentoGeneralData } from "@/core/infrastructure/validation/schemas/documento-general.schema";

export class CreateDocumentoGeneralUseCase {
  constructor(private readonly repository: DocumentoGeneralRepository) {}

  async execute(data: CreateDocumentoGeneralData) {
    return this.repository.create(data);
  }
}
