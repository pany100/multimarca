import { CertificadoEstudioRepository } from "@/core/domain/repositories/certificado-estudio.repository";
import { ListCertificadoEstudioQuery } from "@/core/infrastructure/validation/schemas/certificado-estudio.schema";

export class ListCertificadoEstudioUseCase {
  constructor(private readonly repository: CertificadoEstudioRepository) {}

  async execute(query: ListCertificadoEstudioQuery) {
    return this.repository.list(query);
  }
}
