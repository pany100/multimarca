import { GetByFechaDto } from "../../dto/estadisticas.dto";
import { EstadisticasVOMapper } from "../../mapper/estadisticas-vo.mapper";
import { EstadisticaService } from "../../services/estadistica.service";

export class GetTransaccionesUseCase {
  constructor(private estadisticaService: EstadisticaService) {}

  async execute(dto: GetByFechaDto) {
    const dtoVO = EstadisticasVOMapper.getByFechaToVo(dto);
    const result = await this.estadisticaService.getTransacciones(dtoVO);
    return result.map((item) => ({
      monto: item.totalMonto,
      tipoOperacion: item.tipoOperacion,
    }));
  }
}
