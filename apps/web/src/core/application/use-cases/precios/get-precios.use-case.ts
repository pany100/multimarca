import { PrecioDto } from "@/core/infrastructure/validation/schemas/precio.schema";
import { GetPreciosService } from "../../services/get-precios.service";

export class GetPreciosUseCase {
  constructor(private readonly service: GetPreciosService) {}

  async execute(dto: PrecioDto) {
    return this.service.getPreciosForOrden(dto);
  }
}
