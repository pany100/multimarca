import { prisma } from "@/core/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

export class EstadisticasManoDeObraService {
  constructor() {}

  async getTotalManoDeObra(from: Date | undefined, to: Date | undefined) {
    return await prisma.$queryRaw`
      SELECT 
        SUM(t.precioUnitario) AS totalGlobalManoDeObra,
        COUNT(DISTINCT o.id) AS cantidadOrdenes
      FROM OrdenReparacion o
      INNER JOIN TrabajoRealizado t 
        ON o.id = t.ordenReparacionId
      WHERE o.estado = 'Terminado'
        ${
          from ? Prisma.sql`AND DATE(o.fechaCreacion) >= ${from}` : Prisma.empty
        }
        ${to ? Prisma.sql`AND DATE(o.fechaCreacion) <= ${to}` : Prisma.empty};
    `;
  }

  async getTopManoDeObra(from: Date | undefined, to: Date | undefined) {
    return await prisma.$queryRaw`
      SELECT 
        t.descripcion,
        SUM(t.precioUnitario) AS totalPorTrabajo,
        COUNT(DISTINCT o.id) AS cantidadOrdenes
      FROM OrdenReparacion o
      INNER JOIN TrabajoRealizado t 
        ON o.id = t.ordenReparacionId
      WHERE o.estado = 'Terminado'
      ${from ? Prisma.sql`AND DATE(o.fechaCreacion) >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(o.fechaCreacion) <= ${to}` : Prisma.empty};
      GROUP BY t.descripcion
      ORDER BY totalPorTrabajo DESC
      LIMIT 10;
    `;
  }
}
