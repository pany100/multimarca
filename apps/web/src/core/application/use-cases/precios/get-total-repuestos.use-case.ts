import { GetTotalRepuestosService } from "@/core/application/services/get-total-repuestos.service";
import { PrecioFinalRepuestosDto } from "@/core/infrastructure/validation/schemas/precio.schema";

export class GetTotalRepuestosUseCase {
  constructor(
    private readonly getTotalRepuestosService: GetTotalRepuestosService
  ) {}

  async execute(dto: PrecioFinalRepuestosDto) {
    return await this.getTotalRepuestosService.getTotalRepuestos(dto);
  }
}
