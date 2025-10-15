import { HoraExtraRepository } from "@/core/domain/repositories/hora-extra.repository";

export class DeleteHoraExtraUseCase {
  constructor(private readonly repository: HoraExtraRepository) {}

  async execute(id: number) {
    return this.repository.delete(id);
  }
}
