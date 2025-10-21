import { GetTotalReparacionesService } from "@/core/application/services/get-total-reparaciones.service";
import { PrecioFinalReparacionesDto } from "@/core/infrastructure/validation/schemas/precio.schema";

export class GetTotalReparacionesUseCase {
  constructor(
    private readonly getTotalReparacionesService: GetTotalReparacionesService
  ) {}

  async execute(dto: PrecioFinalReparacionesDto) {
    return await this.getTotalReparacionesService.getTotalReparaciones(dto);
  }
}
