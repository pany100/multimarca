import { OrdenReparacionRepository } from "@/core/domain/repositories/orden-reparacion.repository";

export class DeleteReciboUseCase {
  constructor(private ordenRepository: OrdenReparacionRepository) {}

  async execute(ordenId: number, reciboPath: string) {
    return await this.ordenRepository.deleteRecibo(ordenId, reciboPath);
  }
}
