import { BalanceGeneralDto } from "../../dto/estadisticas.dto";
import { EstadisticasVOMapper } from "../../mapper/estadisticas-vo.mapper";
import { EstadisticaService } from "../../services/estadistica.service";

export class GetBalanceUseCase {
  constructor(private estadisticaService: EstadisticaService) {}

  async execute(dto: BalanceGeneralDto) {
    const dtoVO = EstadisticasVOMapper.getBalanceGeneralToVo(dto);
    return await this.estadisticaService.getBalance(dtoVO);
  }
}
