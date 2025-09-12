import { GetAutosDto } from "../../dto/estadisticas.dto";
import { EstadisticasVOMapper } from "../../mapper/estadisticas-vo.mapper";
import { EstadisticaService } from "../../services/estadistica.service";

export class GetAutosUseCase {
  constructor(private estadisticaService: EstadisticaService) {}

  async execute(dto: GetAutosDto) {
    const dtoVO = EstadisticasVOMapper.getAutosToVo(dto);
    const result = await this.estadisticaService.getAutos(dtoVO);
    return result.map((item) => ({
      marca: item.marca,
      cantidad: Number(item.cantidad),
    }));
  }
}
