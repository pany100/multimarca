import { PresupuestoRepository } from "@/core/domain/repositories/presupuesto.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";

export class GetPresupuestoUseCase {
  constructor(private readonly repo: PresupuestoRepository) {}

  async execute(id: number) {
    const presupuesto = await this.repo.findById(id);

    if (!presupuesto) {
      throw new Error("Presupuesto not found");
    }
    const comprobanteCalculado =
      ComprobanteCalculadoFactory.fromPresupuesto(presupuesto);
    const reparacionesDeTercero = presupuesto.reparacionesDeTercero.map(
      (el: any) => ({
        ...el,
        recibo: el.reciboFile?.finalPath || el.reciboFile?.tempPath || null,
        precioConRecargo: comprobanteCalculado.getPrecioFinalForReparaciones(
          el.precioVenta
        ),
      })
    );

    return {
      ...presupuesto,
      reparacionesDeTercero,
      total: comprobanteCalculado.total,
      totalManoDeObra: comprobanteCalculado.totalManoDeObra,
      totalRepuestos: comprobanteCalculado.totalRepuestos,
      totalReparacionesDeTerceros: comprobanteCalculado.totalTerceros,
    };
  }
}
