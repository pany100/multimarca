import { HoraExtraRepository } from "@/core/domain/repositories/hora-extra.repository";

export class GetHoraExtraUseCase {
  constructor(private readonly repository: HoraExtraRepository) {}

  async execute(id: number) {
    return this.repository.findById(id);
  }
}
