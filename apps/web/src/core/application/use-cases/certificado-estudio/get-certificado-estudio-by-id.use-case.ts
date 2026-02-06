import { CertificadoEstudioRepository } from "@/core/domain/repositories/certificado-estudio.repository";

export class GetCertificadoEstudioByIdUseCase {
  constructor(private readonly repository: CertificadoEstudioRepository) {}

  async execute(id: number) {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new Error("Certificado de estudio no encontrado");
    }
    return item;
  }
}
