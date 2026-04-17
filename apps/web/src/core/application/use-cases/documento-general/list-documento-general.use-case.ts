import { DocumentoGeneralRepository } from "@/core/domain/repositories/documento-general.repository";
import { ListDocumentoGeneralQuery } from "@/core/infrastructure/validation/schemas/documento-general.schema";

export class ListDocumentoGeneralUseCase {
  constructor(private readonly repository: DocumentoGeneralRepository) {}

  async execute(query: ListDocumentoGeneralQuery) {
    return this.repository.list(query);
  }
}
