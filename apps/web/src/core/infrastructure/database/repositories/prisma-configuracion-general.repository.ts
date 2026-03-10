import type {
  ConfiguracionGeneral,
  ConfiguracionGeneralRepository,
} from "@/core/domain/repositories/configuracion-general.repository";
import { prisma } from "@/core/infrastructure/database/prisma";

export class PrismaConfiguracionGeneralRepository
  implements ConfiguracionGeneralRepository
{
  async findById(id: number): Promise<ConfiguracionGeneral | null> {
    const row = await prisma.configuracionGeneral.findUnique({
      where: { id },
    });
    if (!row) return null;
    return {
      id: row.id,
      nombre: row.nombre,
      valor: row.valor,
    };
  }
}
