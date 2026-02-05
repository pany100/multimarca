import { ManoDeObraRepository } from "@/core/domain/repositories/mano-de-obra.repository";

export class ExportAllManoDeObraUseCase {
  constructor(private readonly repository: ManoDeObraRepository) {}

  async execute() {
    return this.repository.exportAll();
  }
}
