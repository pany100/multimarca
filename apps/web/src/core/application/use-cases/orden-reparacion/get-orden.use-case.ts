import { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";

export class GetOrdenUseCase {
  constructor(private readonly repo: OrdenReparacionRepository) {}

  async execute(id: number) {
    const order = await this.repo.findById(id);
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
    };
  }
}
