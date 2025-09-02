import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import { VentaService } from "../../services/venta.service";

export class DeleteVentaUseCase {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly service: VentaService
  ) {}
  async execute(id: number) {
    await this.uow.run(async (tx) => {
      await this.service.delete(tx, id);
    });
    return { ok: true };
  }
}
