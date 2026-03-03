import type { FeriadoRepository } from "@/core/domain/repositories/feriado.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaFeriadoRepository implements FeriadoRepository {
  async existsByFecha(fecha: Date): Promise<boolean> {
    const normalized = new Date(fecha);
    normalized.setHours(0, 0, 0, 0);

    const feriado = await prisma.feriado.findFirst({
      where: {
        fecha: normalized,
      },
    });
    return feriado != null;
  }
}
