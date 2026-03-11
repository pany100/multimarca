import { prisma } from "@/core/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

type TotalProveedoresRow = {
  totalGlobal: number | bigint | string;
  cantidadGastos: number | bigint | string;
};

type TopProveedorRow = {
  proveedorNombre: string | null;
  totalGastado: number | bigint | string;
  cantidadGastos: number | bigint | string;
};

export class EstadisticasProveedoresService {
  async getTotalProveedores(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<TotalProveedoresRow[]> {
    return await prisma.$queryRaw<TotalProveedoresRow[]>`
      SELECT 
        COALESCE(SUM(
          CASE WHEN g.moneda = 'Dolar' 
            THEN (g.precio + COALESCE(g.gastosBancarios, 0)) * COALESCE(g.cotizacionDolar, 1)
            ELSE (g.precio + COALESCE(g.gastosBancarios, 0))
          END
        ), 0) AS totalGlobal,
        COUNT(*) AS cantidadGastos
      FROM Gasto g
      WHERE g.proveedorId IS NOT NULL
      ${from ? Prisma.sql`AND DATE(g.fecha) >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(g.fecha) <= ${to}` : Prisma.empty}
    `;
  }

  async getTopProveedores(
    from: Date | undefined,
    to: Date | undefined,
  ): Promise<TopProveedorRow[]> {
    return await prisma.$queryRaw<TopProveedorRow[]>`
      SELECT 
        p.name AS proveedorNombre,
        COALESCE(SUM(
          CASE WHEN g.moneda = 'Dolar' 
            THEN (g.precio + COALESCE(g.gastosBancarios, 0)) * COALESCE(g.cotizacionDolar, 1)
            ELSE (g.precio + COALESCE(g.gastosBancarios, 0))
          END
        ), 0) AS totalGastado,
        COUNT(*) AS cantidadGastos
      FROM Gasto g
      INNER JOIN Proveedor p ON p.id = g.proveedorId
      WHERE g.proveedorId IS NOT NULL
      ${from ? Prisma.sql`AND DATE(g.fecha) >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql`AND DATE(g.fecha) <= ${to}` : Prisma.empty}
      GROUP BY g.proveedorId, p.name
      ORDER BY totalGastado DESC
      LIMIT 20
    `;
  }
}
