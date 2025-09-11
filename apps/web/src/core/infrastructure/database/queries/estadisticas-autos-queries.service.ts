import { EstadisticasBaseVO } from "@/core/domain/value-objects/estadisticas-base.vo";
import { prisma } from "@/core/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

interface MarcaAuto {
  marca: string;
  cantidad: number;
}

export class EstadisticasAutosQueriesService {
  constructor() {}

  async getAutos(dto: EstadisticasBaseVO) {
    const { fechaInicio, fechaFin } = dto.toObjectWithStrings();
    return await prisma.$queryRaw<MarcaAuto[]>`
      SELECT 
        COALESCE(a.brand, 'Sin marca') as marca, 
        CAST(COUNT(DISTINCT orep.id) AS UNSIGNED) as cantidad
      FROM Auto a
      JOIN OrdenReparacion orep ON a.id = orep.autoId
      WHERE orep.estado = 'Terminado'
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND orep.fechaCreacion >= ${fechaInicio} AND orep.fechaCreacion < ${fechaFin}`
          : Prisma.empty
      }
      GROUP BY a.brand
      ORDER BY cantidad DESC
    `;
  }
}
