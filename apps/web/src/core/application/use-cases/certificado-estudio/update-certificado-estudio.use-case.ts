import { CertificadoEstudioRepository } from "@/core/domain/repositories/certificado-estudio.repository";
import { UpdateCertificadoEstudioData } from "@/core/infrastructure/validation/schemas/certificado-estudio.schema";

export class UpdateCertificadoEstudioUseCase {
  constructor(private readonly repository: CertificadoEstudioRepository) {}

  async execute(data: UpdateCertificadoEstudioData) {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Certificado de estudio no encontrado");
    }
    return this.repository.update(data);
  }
}
