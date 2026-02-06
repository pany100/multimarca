import { CertificadoEstudioRepository } from "@/core/domain/repositories/certificado-estudio.repository";
import { CreateCertificadoEstudioData } from "@/core/infrastructure/validation/schemas/certificado-estudio.schema";

export class CreateCertificadoEstudioUseCase {
  constructor(private readonly repository: CertificadoEstudioRepository) {}

  async execute(data: CreateCertificadoEstudioData) {
    return this.repository.create(data);
  }
}
