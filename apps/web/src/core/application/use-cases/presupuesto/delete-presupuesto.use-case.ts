import { PresupuestoService } from "../../services/presupuesto.service";

export class DeletePresupuestoUseCase {
  constructor(private readonly service: PresupuestoService) {}

  async execute(id: number) {
    await this.service.delete(id);
    return { ok: true };
  }
}
