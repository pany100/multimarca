import { prisma } from "@/core/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

type TotalManoDeObraRow = {
  totalGlobalManoDeObra: number | bigint | string;
  cantidadOrdenes: number | bigint | string;
};

type TopManoDeObraRow = {
  descripcion: string | null;
  totalPorTrabajo: number | bigint | string;
  cantidadOrdenes: number | bigint | string;
};

export class EstadisticasManoDeObraService {
  constructor() {}

  async getTotalManoDeObra(
    from: Date | undefined,
    to: Date | undefined
  ): Promise<TotalManoDeObraRow[]> {
    return await prisma.$queryRaw<TotalManoDeObraRow[]>`
      SELECT 
        SUM(t.precioUnitario) AS totalGlobalManoDeObra,
        COUNT(DISTINCT o.id) AS cantidadOrdenes
      FROM OrdenReparacion o
      INNER JOIN TrabajoRealizado t 
        ON o.id = t.ordenReparacionId
      WHERE o.estado = 'Terminado'
      AND t.descripcion != 'mo'
      AND t.descripcion != 'Mano de obra'
      ${from ? Prisma.sql`AND DATE(o.fechaCreacion) >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(o.fechaCreacion) <= ${to}` : Prisma.empty};
    `;
  }

  async getTopManoDeObra(
    from: Date | undefined,
    to: Date | undefined
  ): Promise<TopManoDeObraRow[]> {
    return await prisma.$queryRaw<TopManoDeObraRow[]>`
      SELECT 
        t.descripcion,
        SUM(t.precioUnitario) AS totalPorTrabajo,
        COUNT(DISTINCT o.id) AS cantidadOrdenes
      FROM OrdenReparacion o
      INNER JOIN TrabajoRealizado t 
        ON o.id = t.ordenReparacionId
      WHERE o.estado = 'Terminado'
      AND t.descripcion != 'mo'
      AND t.descripcion != 'Mano de obra'
      ${from ? Prisma.sql`AND DATE(o.fechaCreacion) >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(o.fechaCreacion) <= ${to}` : Prisma.empty}
      GROUP BY t.descripcion
      ORDER BY totalPorTrabajo DESC
      LIMIT 10;
    `;
  }
}
