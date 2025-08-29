import type { UnitOfWork } from "@/core/domain/ports/uow.port";
import { OrdenReparacionService } from "../../services/orden-reparacion.service";

export class DeleteOrdenUseCase {
  constructor(
    private readonly uow: UnitOfWork,
    private readonly service: OrdenReparacionService
  ) {}
  async execute(id: number) {
    await this.uow.run(async (tx) => {
      await this.service.delete(tx, id);
    });
    return { ok: true };
  }
}
