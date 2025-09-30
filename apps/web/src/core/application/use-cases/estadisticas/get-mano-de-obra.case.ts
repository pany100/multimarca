import { EstadisticasManoDeObraService } from "@/core/infrastructure/database/queries/estadisticas-mano-de-obra.service";
import { DateRangeDto } from "../../dto/estadisticas.dto";

export class GetManoDeObraUseCase {
  constructor(private readonly service: EstadisticasManoDeObraService) {}

  async execute(dto: DateRangeDto) {
    const totalManoDeObra = await this.service.getTotalManoDeObra(
      dto.from,
      dto.to
    );
    if (!Array.isArray(totalManoDeObra) || totalManoDeObra.length === 0) {
      throw new Error("No se encontraron datos");
    }

    const topManoDeObra = await this.service.getTopManoDeObra(dto.from, dto.to);
    if (!Array.isArray(topManoDeObra) || topManoDeObra.length === 0) {
      throw new Error("No se encontraron datos");
    }
    const total = totalManoDeObra[0];

    return {
      totalManoDeObra: Number(total.totalGlobalManoDeObra),
      cantidadTotalOrdenesAtendidas: Number(total.cantidadOrdenes),
      ordenes: topManoDeObra.map((o) => ({
        descripcion: o.descripcion,
        totalPorTrabajo: Number(o.totalPorTrabajo),
        cantidadOrdenes: Number(o.cantidadOrdenes),
      })),
    };
  }
}
