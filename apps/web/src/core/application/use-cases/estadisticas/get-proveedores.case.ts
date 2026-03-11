import { EstadisticasProveedoresService } from "@/core/infrastructure/database/queries/estadisticas-proveedores.service";
import { DateRangeDto } from "../../dto/estadisticas.dto";

export class GetProveedoresUseCase {
  constructor(private readonly service: EstadisticasProveedoresService) {}

  async execute(dto: DateRangeDto) {
    const totalResult = await this.service.getTotalProveedores(
      dto.from,
      dto.to
    );
    const topResult = await this.service.getTopProveedores(dto.from, dto.to);

    const total = totalResult[0];
    const totalGlobal = Number(total?.totalGlobal ?? 0);
    const cantidadGastos = Number(total?.cantidadGastos ?? 0);

    const proveedores = Array.isArray(topResult)
      ? topResult.map((r) => ({
          proveedorNombre: r.proveedorNombre ?? "Sin nombre",
          totalGastado: Number(r.totalGastado),
          cantidadGastos: Number(r.cantidadGastos),
        }))
      : [];

    return {
      totalGlobal,
      cantidadGastos,
      proveedores,
    };
  }
}
