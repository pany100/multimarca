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
    return {
      ...ordenReparacionWithoutMecanicos,
      mecanicos: mecanicosWithoutMecanico,
      recibos: order.recibosFiles.map(
        (el: { finalPath: string }) => el.finalPath
      ),
      pdfPath: order.scannerFile?.finalPath,
    };
  }
}
