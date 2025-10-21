import { GetPreciosFinalRepuestosService } from "@/core/application/services/get-precios-final-repuestos.service";
import { PrecioFinalRepuestosDto } from "@/core/infrastructure/validation/schemas/precio.schema";

export class GetPreciosFinalRepuestosUseCase {
  constructor(
    private readonly getPreciosFinalRepuestosService: GetPreciosFinalRepuestosService
  ) {}

  async execute(dto: PrecioFinalRepuestosDto) {
    return await this.getPreciosFinalRepuestosService.getPreciosFinalForRepuestos(
      dto
    );
  }
}
