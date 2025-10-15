import { HoraExtraRepository } from "@/core/domain/repositories/hora-extra.repository";
import { CreateHoraExtraData } from "@/core/infrastructure/validation/schemas/hora-extra.schema";

export class CreateHoraExtraUseCase {
  constructor(private readonly repository: HoraExtraRepository) {}

  async execute(data: CreateHoraExtraData) {
    return this.repository.create(data);
  }
}
