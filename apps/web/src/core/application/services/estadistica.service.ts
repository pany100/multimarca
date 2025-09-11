import { EstadisticasBaseVO } from "@/core/domain/value-objects/estadisticas-base.vo";
import { EstadisticasAutosQueriesService } from "@/core/infrastructure/database/queries/estadisticas-autos-queries.service";

export class EstadisticaService {
  constructor(
    private readonly estadisticasAutosQueriesService: EstadisticasAutosQueriesService
  ) {}

  async getAutos(dto: EstadisticasBaseVO) {
    const result = await this.estadisticasAutosQueriesService.getAutos(dto);
    return result.map((item) => ({
      marca: item.marca,
      cantidad: Number(item.cantidad),
    }));
  }
}
