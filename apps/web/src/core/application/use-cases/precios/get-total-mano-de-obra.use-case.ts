import { GetTotalManoDeObraService, TotalManoDeObraDto } from "@/core/application/services/get-total-mano-de-obra.service";

export class GetTotalManoDeObraUseCase {
  constructor(
    private readonly getTotalManoDeObraService: GetTotalManoDeObraService
  ) {}

  async execute(dto: TotalManoDeObraDto) {
    return await this.getTotalManoDeObraService.getTotalManoDeObra(dto);
  }
}
