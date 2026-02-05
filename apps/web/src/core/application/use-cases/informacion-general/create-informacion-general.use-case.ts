import { InformacionGeneralRepository } from "@/core/domain/repositories/informacion-general.repository";
import { CreateInformacionGeneralData } from "@/core/infrastructure/validation/schemas/informacion-general.schema";

export class CreateInformacionGeneralUseCase {
  constructor(
    private readonly repository: InformacionGeneralRepository
  ) {}

  async execute(data: CreateInformacionGeneralData) {
    return this.repository.create(data);
  }
}
