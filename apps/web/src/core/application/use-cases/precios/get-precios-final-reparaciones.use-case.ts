import { GetPreciosFinalReparacionesService } from "@/core/application/services/get-precios-final-reparaciones.service";
import { PrecioFinalReparacionesDto } from "@/core/infrastructure/validation/schemas/precio.schema";

export class GetPreciosFinalReparacionesUseCase {
  constructor(
    private readonly getPreciosFinalReparacionesService: GetPreciosFinalReparacionesService
  ) {}

  async execute(dto: PrecioFinalReparacionesDto) {
    return await this.getPreciosFinalReparacionesService.getPreciosFinalForReparaciones(
      dto
    );
  }
}
