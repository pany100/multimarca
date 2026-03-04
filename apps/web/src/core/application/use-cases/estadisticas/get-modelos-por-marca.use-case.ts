import { getMarcaAliasesForQuery } from "@/core/domain/marca-canonicos";
import { GetModelosPorMarcaDto } from "../../dto/estadisticas.dto";
import { EstadisticasVOMapper } from "../../mapper/estadisticas-vo.mapper";
import { EstadisticaService } from "../../services/estadistica.service";

export class GetModelosPorMarcaUseCase {
  constructor(private estadisticaService: EstadisticaService) {}

  async execute(dto: GetModelosPorMarcaDto) {
    const dtoVO = EstadisticasVOMapper.getModelosPorMarcaToVo(dto);
    const marcaCanonical = (dto.marca || "PEUGEOT").toUpperCase().trim();
    const marcasParaQuery = getMarcaAliasesForQuery(marcaCanonical);
    const result = await this.estadisticaService.getModelosPorMarca(
      dtoVO,
      marcasParaQuery
    );

    const total = result.reduce(
      (acc, item) => acc + Number(item.cantidad),
      0
    );

    return result.map((item) => {
      const cantidad = Number(item.cantidad);
      const porcentaje = total > 0 ? (cantidad * 100) / total : 0;

      return {
        modelo: item.modelo,
        cantidad,
        porcentaje,
      };
    });
  }
}

