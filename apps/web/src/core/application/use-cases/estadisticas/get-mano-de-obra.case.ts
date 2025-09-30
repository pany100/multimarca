import { EstadisticasManoDeObraService } from "@/core/infrastructure/database/queries/estadisticas-mano-de-obra.service";
import { DateRangeDto } from "../../dto/estadisticas.dto";

export class GetManoDeObraUseCase {
  constructor(private readonly service: EstadisticasManoDeObraService) {}

  async execute(dto: DateRangeDto) {
    const totalManoDeObra = await this.service.getTotalManoDeObra(
      dto.from,
      dto.to
    );
    const topManoDeObra = await this.service.getTopManoDeObra(dto.from, dto.to);
    console.log(totalManoDeObra);
    console.log(topManoDeObra);
    return { totalManoDeObra, topManoDeObra };
  }
}
