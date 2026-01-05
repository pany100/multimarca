import { PatchVentaDto } from "@/core/application/dto/venta.dto";
import { ComprobanteCalculado } from "@/core/application/services/comprobante-calculado";
import {
  VentaRepository,
  VentaWithRelations,
} from "@/core/domain/repositories/venta.repository";
import { getPrecioFinalForReparaciones } from "@/utils/fieldHelper";

export class PatchVentaUseCase {
  constructor(private readonly ventaRepository: VentaRepository) {}

  async execute(dto: PatchVentaDto): Promise<VentaWithRelations> {
    const { id, ...updateData } = dto;

    // Update venta with only provided fields
    const updatedVenta = await this.ventaRepository.patchVenta(id, updateData);

    // Recalculate totals
    const trabajosPrecio = updatedVenta.trabajosRealizados.reduce(
      (sum, trabajo) => sum + Number(trabajo.precioUnitario),
      0
    );

    const repuestosPrecio = updatedVenta.repuestosUsados.reduce(
      (sum, repuesto) => sum + Number(repuesto.precioVenta),
      0
    );

    const reparacionesPrecio = updatedVenta.reparacionesDeTercero
      .map((el) => {
        const precioConRecargo = getPrecioFinalForReparaciones(
          Number(el.precioVenta),
          Number(updatedVenta.porcentajeRecargo)
        );
        return {
          precioConRecargo,
        };
      })
      .reduce((sum, el) => sum + el.precioConRecargo, 0);

    const precioBase = trabajosPrecio + repuestosPrecio + reparacionesPrecio;

    const comprobante = new ComprobanteCalculado(
      precioBase,
      Number(updatedVenta.descuento),
      Number(updatedVenta.incremento)
    );

    const totalPagado = updatedVenta.ingresos.reduce(
      (sum, ingreso) => sum + Number(ingreso.monto),
      0
    );

    return {
      ...updatedVenta,
      precioTotal: comprobante.totalPagado,
      totalPagado,
    } as any;
  }
}
