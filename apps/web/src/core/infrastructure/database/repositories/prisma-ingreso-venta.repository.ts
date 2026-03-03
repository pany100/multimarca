import { UpdateRevisadoYEnviadoDto } from "@/core/application/dto/resumen.dto";
import { TransaccionRepository } from "@/core/domain/repositories/transaccion.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaIngresoVentaRepository implements TransaccionRepository {
  async update(dto: UpdateRevisadoYEnviadoDto) {
    const data: { revisado?: boolean; reciboEnviado?: boolean } = {};
    if (dto.revisado !== undefined) data.revisado = dto.revisado;
    if (dto.reciboEnviado !== undefined) data.reciboEnviado = dto.reciboEnviado;
    return prisma.ingresoPorVenta.update({
      where: { id: dto.id },
      data,
    });
  }
}
