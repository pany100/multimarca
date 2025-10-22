import { prisma } from "@/core/infrastructure/database/prisma";
import { Prisma } from "@prisma/client";

export class EstadisticasBalanceQueriesService {
  async getVentasTotales(
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<number> {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM(v.total_venta) AS total
      FROM v_ventas_totales v
      WHERE 1=1
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND v.fecha >= ${fechaInicio} AND v.fecha < ${fechaFin}`
          : Prisma.empty
      }
    `;
    return Number(rows[0]?.total ?? 0);
  }

  async getVentasTotalesUsd(
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<number> {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM(v.total_venta / COALESCE(d.blue,1)) AS total
      FROM v_ventas_totales v
      LEFT JOIN Dolar d ON d.id = v.dolar_id
      WHERE 1=1
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND v.fecha >= ${fechaInicio} AND v.fecha < ${fechaFin}`
          : Prisma.empty
      }
    `;
    return Number(rows[0]?.total ?? 0);
  }

  async getReparacionesTotales(
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<number> {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM(orep.total_reparacion) AS total
      FROM v_orep_totales orep
      WHERE 1=1
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND orep.fecha >= ${fechaInicio} AND orep.fecha < ${fechaFin}`
          : Prisma.empty
      }
    `;
    return Number(rows[0]?.total ?? 0);
  }

  async getReparacionesTotalesUsd(
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<number> {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM(orep.total_reparacion / COALESCE(d.blue,1)) AS total
      FROM v_orep_totales orep
      LEFT JOIN Dolar d ON d.id = orep.dolar_id
      WHERE 1=1
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND orep.fecha >= ${fechaInicio} AND orep.fecha < ${fechaFin}`
          : Prisma.empty
      }
    `;
    return Number(rows[0]?.total ?? 0);
  }

  async getIngresosManualesTotales(
    fechaInicio: string | undefined,
    fechaFin: string | undefined
  ): Promise<number> {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM(
        CASE
          WHEN i.moneda = 'Dolar' THEN i.monto * COALESCE(i.cotizacionDolar,1)
          ELSE i.monto
        END
      ) AS total
      FROM IngresoManualDeDinero i
      WHERE 1=1
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND i.fecha >= ${fechaInicio} AND i.fecha < ${fechaFin}`
          : Prisma.empty
      }
    `;
    return Number(rows[0]?.total ?? 0);
  }

  async getIngresosManualesTotalesUsd(
    fechaInicio: string | undefined,
    fechaFin: string | undefined
  ): Promise<number> {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM(
        CASE
          WHEN i.moneda = 'Dolar' THEN i.monto
          ELSE i.monto / COALESCE(i.cotizacionDolar,1)
        END
      ) AS total
      FROM IngresoManualDeDinero i
      WHERE 1=1
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND i.fecha >= ${fechaInicio} AND i.fecha < ${fechaFin}`
          : Prisma.empty
      }
    `;
    return Number(rows[0]?.total ?? 0);
  }

  async getGastosTotales(
    fechaInicio: string | undefined,
    fechaFin: string | undefined
  ): Promise<number> {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM(
      CASE
        WHEN g.moneda = 'Dolar' THEN g.precio * COALESCE(g.cotizacionDolar,1)
        ELSE g.precio
      END
      ) AS total
      FROM Gasto g
      WHERE 1=1
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND g.fecha >= ${fechaInicio} AND g.fecha < ${fechaFin}`
          : Prisma.empty
      }
    `;
    return Number(rows[0]?.total ?? 0);
  }

  async getGastosTotalesUsd(
    fechaInicio: string | undefined,
    fechaFin: string | undefined
  ): Promise<number> {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT SUM(
        CASE
          WHEN g.moneda = 'Dolar' THEN g.precio
          ELSE g.precio / COALESCE(g.cotizacionDolar,1)
        END
      ) AS total
      FROM Gasto g
      WHERE 1=1
      ${
        fechaInicio && fechaFin
          ? Prisma.sql`AND g.fecha >= ${fechaInicio} AND g.fecha < ${fechaFin}`
          : Prisma.empty
      }
    `;
    return Number(rows[0]?.total ?? 0);
  }
}
