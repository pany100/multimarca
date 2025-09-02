import { VentaRepository } from "@/core/domain/repositories/venta.repository";
import { GetVentaDto } from "../../dto/venta.dto";

export class GetVentaUseCase {
  constructor(private readonly repo: VentaRepository) {}

  async execute(dto: GetVentaDto) {
    const venta = await this.repo.findById(dto.id);
    if (!venta) {
      throw new Error("Venta not found");
    }
    const reparacionesDeTercero = venta.reparacionesDeTercero.map((el) => ({
      ...el,
      recibo: el.reciboFile?.finalPath || el.reciboFile?.tempPath || null,
    }));
    return {
      ...venta,
      reparacionesDeTercero,
    };
  }
}
