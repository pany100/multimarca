import { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";
import { ComprobanteCalculadoFactory } from "@/core/domain/services/comprobante-calculado.factory";

export class GetOrdenUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(id: number) {
    const order = await this.repo.findById(id);
    if (!order) {
      throw new Error("Orden no encontrada");
    }
    const { mecanicos, ...ordenReparacionWithoutMecanicos } = order;
    const mecanicosWithoutMecanico = mecanicos.map(
      (el: {
        mecanico: { id: number; name: string };
        detalle: string | null;
      }) => ({
        id: el.mecanico.id,
        name: el.mecanico.name,
        detalle: el.detalle,
      })
    );
    const reparacionesDeTercero = order.reparacionesDeTercero.map(
      (el: { reciboFile: { finalPath?: string; tempPath?: string } }) => ({
        ...el,
        recibo: el.reciboFile?.finalPath || el.reciboFile?.tempPath || null,
      })
    );
    const comprobanteCalculado = ComprobanteCalculadoFactory.fromOrden(order);
    return {
      ...ordenReparacionWithoutMecanicos,
      mecanicos: mecanicosWithoutMecanico,
      reparacionesDeTercero,
      recibos: order.recibosFiles.map(
        (el: { finalPath?: string; tempPath?: string }) =>
          el.finalPath || el.tempPath || null
      ),
      pdfPath:
        order.scannerFile?.finalPath || order.scannerFile?.tempPath || null,
      total: comprobanteCalculado.total,
      totalPagado: comprobanteCalculado.totalPagado,
      totalManoDeObra: comprobanteCalculado.totalManoDeObra,
      deuda: comprobanteCalculado.deuda,
    };
  }
}
