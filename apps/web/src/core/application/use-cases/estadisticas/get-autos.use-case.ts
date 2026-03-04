import { normalizeMarcaToCanonical } from "@/core/domain/marca-canonicos";
import { GetAutosDto } from "../../dto/estadisticas.dto";
import { EstadisticasVOMapper } from "../../mapper/estadisticas-vo.mapper";
import { EstadisticaService } from "../../services/estadistica.service";

export class GetAutosUseCase {
  constructor(private estadisticaService: EstadisticaService) {}

  async execute(dto: GetAutosDto) {
    const dtoVO = EstadisticasVOMapper.getAutosToVo(dto);
    const result = await this.estadisticaService.getAutos(dtoVO);

    // Unificar por marca canónica (ej. CITROEN + CITRÖEN → una sola con suma)
    const porMarca = new Map<string, number>();
    for (const item of result) {
      const canonico = normalizeMarcaToCanonical(item.marca);
      const prev = porMarca.get(canonico) ?? 0;
      porMarca.set(canonico, prev + Number(item.cantidad));
    }

    return Array.from(porMarca.entries())
      .map(([marca, cantidad]) => ({ marca, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }
}
