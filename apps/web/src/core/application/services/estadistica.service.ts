import { EstadisticasBalanceVO } from "@/core/domain/value-objects/estadisticas-balance.vo";
import { EstadisticasBaseVO } from "@/core/domain/value-objects/estadisticas-base.vo";
import { EstadisticasMonedaVO } from "@/core/domain/value-objects/estadisticas-moneda.vo";
import { EstadisticasAutosQueriesService } from "@/core/infrastructure/database/queries/estadisticas-autos-queries.service";
import { EstadisticasBalanceQueriesService } from "@/core/infrastructure/database/queries/estadisticas-balance-queries.service";
import { EstadisticasMecanicosQueriesService } from "@/core/infrastructure/database/queries/estadisticas-mecanicos-query.service";
import { EstadisticasTransaccionesQueriesService } from "@/core/infrastructure/database/queries/estadisticas-transacciones-queries.service";

export class EstadisticaService {
  constructor(
    private readonly estadisticasAutosQueriesService: EstadisticasAutosQueriesService,
    private readonly estadisticasBalanceQueriesService: EstadisticasBalanceQueriesService,
    private readonly estadisticasMecanicosQueriesService: EstadisticasMecanicosQueriesService,
    private readonly estadisticasTransaccionesQueriesService: EstadisticasTransaccionesQueriesService
  ) {}

  async getAutos(dto: EstadisticasBaseVO) {
    return await this.estadisticasAutosQueriesService.getAutos(dto);
  }

  async getModelosPorMarca(dto: EstadisticasBaseVO, marcas: string[]) {
    return await this.estadisticasAutosQueriesService.getModelosPorMarca(
      dto,
      marcas
    );
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
    if (moneda === "USD") {
      return await this.getBalanceUsd(dto);
    } else {
      return await this.getBalanceArs(dto);
    }
  }

  async getMecanicos(dto: EstadisticasMonedaVO) {
    const moneda = dto.moneda ?? "ARS";
    const from = dto.from ?? null;
    const to = dto.to ?? null;
    if (moneda === "USD") {
      return await this.estadisticasMecanicosQueriesService.getMecanicosUsd(
        from,
        to
      );
    } else {
      return await this.estadisticasMecanicosQueriesService.getMecanicosArs(
        from,
        to
      );
    }
  }

  async getOrdenesCompartidas(dto: EstadisticasMonedaVO) {
    return await this.estadisticasMecanicosQueriesService.getOrdenesCompartidas(
      dto.from ?? null,
      dto.to ?? null
    );
  }

  async getVentasMecanicos(dto: EstadisticasMonedaVO) {
    const moneda = dto.moneda ?? "ARS";
    const from = dto.from ?? null;
    const to = dto.to ?? null;
    if (moneda === "USD") {
      return await this.estadisticasMecanicosQueriesService.getVentasMecanicosUsd(from, to);
    } else {
      return await this.estadisticasMecanicosQueriesService.getVentasMecanicosArs(from, to);
    }
  }

  async getVentasCompartidas(dto: EstadisticasMonedaVO) {
    return await this.estadisticasMecanicosQueriesService.getVentasCompartidas(
      dto.from ?? null,
      dto.to ?? null
    );
  }

  async getTransacciones(dto: EstadisticasBaseVO) {
    const { fechaInicio, fechaFin } = dto.toObjectWithStrings();
    return await this.estadisticasTransaccionesQueriesService.getTransacciones(
      fechaInicio,
      fechaFin
    );
  }
}
