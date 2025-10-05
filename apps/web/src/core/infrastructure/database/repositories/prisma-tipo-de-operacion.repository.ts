import { TipoDeOperacionRepository } from "@/core/domain/repositories/tipo-de-operacion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaTipoDeOperacionRepository
  implements TipoDeOperacionRepository
{
  constructor() {}

  async delete(id: number) {
    await prisma.tipoDeOperacion.delete({ where: { id } });
  }

  async findById(id: number) {
    return prisma.tipoDeOperacion.findUnique({ where: { id } });
  }
}
