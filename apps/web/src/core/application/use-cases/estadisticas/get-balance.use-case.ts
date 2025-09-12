import { BalanceGeneralDto } from "../../dto/estadisticas.dto";
import { EstadisticasVOMapper } from "../../mapper/estadisticas-vo.mapper";
import { EstadisticaService } from "../../services/estadistica.service";

export class GetBalanceUseCase {
  constructor(private estadisticaService: EstadisticaService) {}

  async execute(dto: BalanceGeneralDto) {
    const dtoVO = EstadisticasVOMapper.getBalanceGeneralToVo(dto);
    const [ventas, reparaciones, ingresosManuales, gastos] =
      await this.estadisticaService.getBalance(dtoVO);

    const ingresos = ventas + reparaciones + ingresosManuales;
    const balance = ingresos - gastos;
    const moneda = dtoVO.moneda ?? "ARS";
    return {
      ingresos: Number(ingresos.toFixed(2)),
      gastos: Number(gastos.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      moneda,
    };
  }
}
