import { CertificadoEstudioRepository } from "@/core/domain/repositories/certificado-estudio.repository";

export class DeleteCertificadoEstudioUseCase {
  constructor(private readonly repository: CertificadoEstudioRepository) {}

  async execute(id: number) {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new Error("Certificado de estudio no encontrado");
    }
    return this.repository.delete(id);
  }
}
