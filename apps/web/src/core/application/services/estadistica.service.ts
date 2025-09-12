import { EstadisticasBalanceVO } from "@/core/domain/value-objects/estadisticas-balance.vo";
import { EstadisticasBaseVO } from "@/core/domain/value-objects/estadisticas-base.vo";
import { EstadisticasAutosQueriesService } from "@/core/infrastructure/database/queries/estadisticas-autos-queries.service";
import { EstadisticasBalanceQueriesService } from "@/core/infrastructure/database/queries/estadisticas-balance-queries.service";

export class EstadisticaService {
  constructor(
    private readonly estadisticasAutosQueriesService: EstadisticasAutosQueriesService,
    private readonly estadisticasBalanceQueriesService: EstadisticasBalanceQueriesService
  ) {}

  async getAutos(dto: EstadisticasBaseVO) {
    const result = await this.estadisticasAutosQueriesService.getAutos(dto);
    return result.map((item) => ({
      marca: item.marca,
      cantidad: Number(item.cantidad),
    }));
  }

  private async getBalanceUsd(dto: EstadisticasBalanceVO) {
    const { fechaInicio, fechaFin } = dto.baseVO.toObjectWithStrings();
    return await Promise.all([
      this.estadisticasBalanceQueriesService.getVentasTotalesUsd(
        fechaInicio,
        fechaFin
      ),
      this.estadisticasBalanceQueriesService.getReparacionesTotalesUsd(
        fechaInicio,
        fechaFin
      ),
      this.estadisticasBalanceQueriesService.getIngresosManualesTotalesUsd(
        fechaInicio,
        fechaFin
      ),
      this.estadisticasBalanceQueriesService.getGastosTotalesUsd(
        fechaInicio,
        fechaFin
      ),
    ]);
  }

  private async getBalanceArs(dto: EstadisticasBalanceVO) {
    const { fechaInicio, fechaFin } = dto.baseVO.toObjectWithStrings();
    return await Promise.all([
      this.estadisticasBalanceQueriesService.getVentasTotales(
        fechaInicio,
        fechaFin
      ),
      this.estadisticasBalanceQueriesService.getReparacionesTotales(
        fechaInicio,
        fechaFin
      ),
      this.estadisticasBalanceQueriesService.getIngresosManualesTotales(
        fechaInicio,
        fechaFin
      ),
      this.estadisticasBalanceQueriesService.getGastosTotales(
        fechaInicio,
        fechaFin
      ),
    ]);
  }

  async getBalance(dto: EstadisticasBalanceVO) {
    const moneda = dto.moneda ?? "ARS";
    let ventas, reparaciones, ingresosManuales, gastos;
    if (moneda === "USD") {
      [ventas, reparaciones, ingresosManuales, gastos] =
        await this.getBalanceUsd(dto);
    } else {
      [ventas, reparaciones, ingresosManuales, gastos] =
        await this.getBalanceArs(dto);
    }
    console.log("ventas", ventas);
    console.log("reparaciones", reparaciones);
    console.log("ingresosManuales", ingresosManuales);
    console.log("gastos", gastos);

    const ingresos = ventas + reparaciones + ingresosManuales;
    const balance = ingresos - gastos;

    return {
      ingresos: Number(ingresos.toFixed(2)),
      gastos: Number(gastos.toFixed(2)),
      balance: Number(balance.toFixed(2)),
      moneda,
    };
  }
}
