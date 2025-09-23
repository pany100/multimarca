import { prisma } from "@/core/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

interface Transaccion {
  totalMonto: string;
  tipoOperacion: number;
}

export class EstadisticasTransaccionesQueriesService {
  constructor() {}

  async getTransacciones(
    fechaInicio: string | undefined,
    fechaFin: string | undefined
  ) {
    return await prisma.$queryRaw<Transaccion[]>`
      WITH transacciones AS (
        -- IngresoManualDeDinero
        SELECT 
          i.monto,
          t.label AS tipoOperacion,
          i.fecha
        FROM IngresoManualDeDinero i
        LEFT JOIN TipoDeOperacion t ON t.id = i.tipoOperacionId

        UNION ALL

        -- IngresoPorVenta
        SELECT 
          i.monto,
          t.label AS tipoOperacion,
          i.fecha
        FROM IngresoPorVenta i
        LEFT JOIN TipoDeOperacion t ON t.id = i.tipoOperacionId

        UNION ALL

        -- IngresoPorReparacion
        SELECT 
          i.monto,
          t.label AS tipoOperacion,
          i.fecha
        FROM IngresoPorReparacion i
        LEFT JOIN TipoDeOperacion t ON t.id = i.tipoOperacionId

        UNION ALL

        -- Gasto
        SELECT 
          g.precio AS monto,
          t.label AS tipoOperacion,
          g.fecha
        FROM Gasto g
        LEFT JOIN TipoDeOperacion t ON t.id = g.tipoOperacionId

        UNION ALL

        -- Extraccion
        SELECT 
          e.monto,
          t.label AS tipoOperacion,
          e.fecha
        FROM Extraccion e
        LEFT JOIN TipoDeOperacion t ON t.id = e.tipoOperacionId
      )
      SELECT 
        tipoOperacion,
        SUM(monto) AS totalMonto
      FROM transacciones
      WHERE 1 = 1
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND fecha >= ${fechaInicio} AND fecha < ${fechaFin}`
          : Prisma.empty
      }
      GROUP BY tipoOperacion
      ORDER BY totalMonto DESC;
    `;
  }
}
