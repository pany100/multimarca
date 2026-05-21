import { prisma } from "@/core/infrastructure/database/prisma";
import {
  getBuenosAiresDayRangeUtc,
  TURNOS_TIMEZONE,
} from "@/lib/turno-fecha-tz";
import { Prisma } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";

type RankingRow = {
  empleadoId: number | bigint | string;
  empleadoNombre: string | null;
  total: number | bigint | string;
  cantidad: number | bigint | string;
};

type PivotRow = {
  empleadoId: number | bigint | string;
  empleadoNombre: string | null;
  categoria: string | null;
  total: number | bigint | string;
  cantidad: number | bigint | string;
};

type EvolucionRow = {
  mes: number | bigint | string;
  anio: number | bigint | string;
  total: number | bigint | string;
};

function fechaBoundsForQuery(
  from?: Date,
  to?: Date
): { gte?: Date; lte?: Date } {
  let gte: Date | undefined;
  let lte: Date | undefined;
  if (from) {
    const key = formatInTimeZone(from, TURNOS_TIMEZONE, "yyyy-MM-dd");
    const r = getBuenosAiresDayRangeUtc(key);
    if (r) gte = r.gte;
  }
  if (to) {
    const key = formatInTimeZone(to, TURNOS_TIMEZONE, "yyyy-MM-dd");
    const r = getBuenosAiresDayRangeUtc(key);
    if (r) lte = r.lte;
  }
  return { gte, lte };
}

// Monto normalizado a pesos: si la moneda es Dolar y hay cotización, multiplica.
const MONTO_NORMALIZADO = Prisma.sql`
  CASE
    WHEN g.moneda = 'Dolar' AND g.cotizacionDolar IS NOT NULL
      THEN g.precio * g.cotizacionDolar
    ELSE g.precio
  END
`;

const MESES = [
  "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export class GastosPorEmpleadoService {
  async getTotal(
    from: Date | undefined,
    to: Date | undefined
  ): Promise<{ total: number; cantidad: number; empleados: number }> {
    const { gte, lte } = fechaBoundsForQuery(from, to);
    const rows = await prisma.$queryRaw<
      { total: number | bigint | string; cantidad: number | bigint | string; empleados: number | bigint | string }[]
    >`
      SELECT
        SUM(${MONTO_NORMALIZADO}) AS total,
        COUNT(*) AS cantidad,
        COUNT(DISTINCT g.mecanicoId) AS empleados
      FROM Gasto g
      WHERE g.mecanicoId IS NOT NULL
      ${gte ? Prisma.sql`AND g.fecha >= ${gte}` : Prisma.empty}
      ${lte ? Prisma.sql`AND g.fecha <= ${lte}` : Prisma.empty};
    `;
    const row = rows?.[0];
    return {
      total: Number(row?.total ?? 0),
      cantidad: Number(row?.cantidad ?? 0),
      empleados: Number(row?.empleados ?? 0),
    };
  }

  async getRanking(
    from: Date | undefined,
    to: Date | undefined
  ): Promise<RankingRow[]> {
    const { gte, lte } = fechaBoundsForQuery(from, to);
    return await prisma.$queryRaw<RankingRow[]>`
      SELECT
        e.id AS empleadoId,
        e.name AS empleadoNombre,
        SUM(${MONTO_NORMALIZADO}) AS total,
        COUNT(*) AS cantidad
      FROM Gasto g
      INNER JOIN Empleado e ON e.id = g.mecanicoId
      WHERE g.mecanicoId IS NOT NULL
      ${gte ? Prisma.sql`AND g.fecha >= ${gte}` : Prisma.empty}
      ${lte ? Prisma.sql`AND g.fecha <= ${lte}` : Prisma.empty}
      GROUP BY e.id, e.name
      ORDER BY total DESC;
    `;
  }

  async getPivotPorCategoria(
    from: Date | undefined,
    to: Date | undefined
  ): Promise<PivotRow[]> {
    const { gte, lte } = fechaBoundsForQuery(from, to);
    return await prisma.$queryRaw<PivotRow[]>`
      SELECT
        e.id AS empleadoId,
        e.name AS empleadoNombre,
        c.nombre AS categoria,
        SUM(${MONTO_NORMALIZADO}) AS total,
        COUNT(*) AS cantidad
      FROM Gasto g
      INNER JOIN Empleado e ON e.id = g.mecanicoId
      INNER JOIN CategoriaGasto c ON c.id = g.categoriaId
      WHERE g.mecanicoId IS NOT NULL
      ${gte ? Prisma.sql`AND g.fecha >= ${gte}` : Prisma.empty}
      ${lte ? Prisma.sql`AND g.fecha <= ${lte}` : Prisma.empty}
      GROUP BY e.id, e.name, c.nombre
      ORDER BY e.name ASC, total DESC;
    `;
  }

  async getEvolucionMensual(): Promise<
    { label: string; total: number }[]
  > {
    const rows = await prisma.$queryRaw<EvolucionRow[]>`
      SELECT
        MONTH(g.fecha) AS mes,
        YEAR(g.fecha) AS anio,
        SUM(${MONTO_NORMALIZADO}) AS total
      FROM Gasto g
      WHERE g.mecanicoId IS NOT NULL
        AND g.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY anio, mes
      ORDER BY anio ASC, mes ASC;
    `;
    return rows.map((r) => ({
      label: `${MESES[Number(r.mes)]} ${Number(r.anio)}`,
      total: Number(r.total),
    }));
  }
}
