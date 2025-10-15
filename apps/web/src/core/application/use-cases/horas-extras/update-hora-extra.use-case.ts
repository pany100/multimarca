import { HoraExtraRepository } from "@/core/domain/repositories/hora-extra.repository";
import { UpdateHoraExtraData } from "@/core/infrastructure/validation/schemas/hora-extra.schema";

export class UpdateHoraExtraUseCase {
  constructor(private readonly repository: HoraExtraRepository) {}

  async execute(data: UpdateHoraExtraData) {
    return this.repository.update(data);
  }
}
