import { PatchPresupuestoDto } from "@/core/application/dto/presupuesto.dto";
import { PresupuestoRepository } from "@/core/domain/repositories/presupuesto.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";

export class PatchPresupuestoUseCase {
  constructor(private presupuestoRepository: PresupuestoRepository) {}

  async execute(dto: PatchPresupuestoDto) {
    const presupuestoId = parseInt(dto.id);

    // Verificar que el presupuesto existe
    const presupuestoExistente = await this.presupuestoRepository.findById(
      presupuestoId
    );
    if (!presupuestoExistente) {
      throw new Error("Presupuesto no encontrado");
    }

    // Validaciones de negocio
    // Aquí puedes agregar validaciones específicas según las reglas de negocio

    // Delegar al repositorio la lógica de mapeo y actualización
    const presupuesto = await this.presupuestoRepository.patchPresupuesto(
      presupuestoId,
      dto
    );

    // Procesar el presupuesto actualizado
    const comprobanteCalculado =
      ComprobanteCalculadoFactory.fromPresupuesto(presupuesto);

    const reparacionesDeTercero = presupuesto.reparacionesDeTercero.map(
      (el: {
        reciboFile: { finalPath?: string; tempPath?: string } | null;
        precioVenta: number;
      }) => ({
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
      totalAPagar: comprobanteCalculado.totalAPagar,
      totalManoDeObra: comprobanteCalculado.totalManoDeObra,
      totalRepuestos: comprobanteCalculado.totalRepuestos,
      totalReparacionesDeTerceros: comprobanteCalculado.totalTerceros,
    };
  }
}
