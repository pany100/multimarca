import { VentaRepository } from "@/core/domain/repositories/venta.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";
import { GetVentaDto } from "../../dto/venta.dto";

export class GetVentaUseCase {
  constructor(private readonly repo: VentaRepository) {}

  async execute(dto: GetVentaDto) {
    const venta = await this.repo.findById(dto.id);
    if (!venta) {
      throw new Error("Venta not found");
    }
    const comprobante = ComprobanteCalculadoFactory.fromVenta(venta);
    const reparacionesDeTercero = venta.reparacionesDeTercero.map((el) => ({
      ...el,
      recibo: el.reciboFile?.finalPath || el.reciboFile?.tempPath || null,
      precioVenta: comprobante.getPrecioFinalForReparaciones(
        el.precioVenta.toNumber()
      ),
    }));
    const repuestosUsados = venta.repuestosUsados.map((el) => ({
      ...el,
      precioVenta: comprobante.getPrecioFinalForRepuestos(
        el.precioVenta.toNumber()
      ),
    }));
    return {
      ...venta,
      reparacionesDeTercero,
      repuestosUsados,
      totalBase: comprobante.totalBase,
      total: comprobante.total,
      totalPagos: comprobante.totalPagado,
    };
  }
}
