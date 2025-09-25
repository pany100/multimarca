import { UpdateRevisadoYEnviadoDto } from "@/core/application/dto/resumen.dto";
import { TransaccionRepository } from "@/core/domain/repositories/transaccion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaExtraccionRepository implements TransaccionRepository {
  async update(dto: UpdateRevisadoYEnviadoDto) {
    return prisma.extraccion.update({
      where: { id: dto.id },
      data: {
        revisado: dto.revisado || false,
      },
    });
  }
}
