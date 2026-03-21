import { EstadisticasProveedoresService } from "@/core/infrastructure/database/queries/estadisticas-proveedores.service";
import { DateRangeDto } from "../../dto/estadisticas.dto";

export class GetProveedoresUseCase {
  constructor(private readonly service: EstadisticasProveedoresService) {}

  async execute(dto: DateRangeDto) {
    const total = await this.service.getTotalProveedores(dto.from, dto.to);
    const top = await this.service.getTopProveedores(dto.from, dto.to);

    const proveedores = top.map((r) => ({
      proveedorId: r.proveedorId,
      proveedorNombre: r.proveedorNombre,
      totalGastado: r.totalGastado,
      cantidadOrdenesCompra: r.cantidadOrdenesCompra,
      cantidadReparacionesTerceroOrden: r.cantidadReparacionesTerceroOrden,
      cantidadReparacionesTerceroVenta: r.cantidadReparacionesTerceroVenta,
      cantidadTotal: r.cantidadTotal,
    }));

    return {
      totalGlobal: total.totalGlobal,
      cantidadOrdenesCompra: total.cantidadOrdenesCompra,
      cantidadReparacionesTerceroOrden: total.cantidadReparacionesTerceroOrden,
      cantidadReparacionesTerceroVenta: total.cantidadReparacionesTerceroVenta,
      cantidadTotal: total.cantidadTotal,
      proveedores,
    };
  }
}
