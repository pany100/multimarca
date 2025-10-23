import { UpdateProveedorRevisadoDto } from "@/core/application/dto/resumen.dto";
import { TransaccionRepository } from "@/core/domain/repositories/transaccion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaProveedorRepository implements TransaccionRepository {
  async update(dto: UpdateProveedorRevisadoDto) {
    return prisma.proveedor.update({
      where: { id: dto.id },
      data: {
        revisado: dto.revisado,
      },
    });
  }
}
