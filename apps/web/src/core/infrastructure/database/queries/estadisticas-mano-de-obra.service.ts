import { prisma } from "@/core/infrastructure/database/prisma";
import {
  getBuenosAiresDayRangeUtc,
  TURNOS_TIMEZONE,
} from "@/lib/turno-fecha-tz";
import { Prisma } from "@prisma/client";
import { formatInTimeZone } from "date-fns-tz";

type TotalManoDeObraRow = {
  totalGlobalManoDeObra: number | bigint | string;
  cantidadOrdenes: number | bigint | string;
};

type TopManoDeObraRow = {
  descripcion: string | null;
  totalPorTrabajo: number | bigint | string;
  cantidadOrdenes: number | bigint | string;
};

type EvolucionRow = {
  mes: number | bigint | string;
  anio: number | bigint | string;
  total: number | bigint | string;
  ordenes: number | bigint | string;
};

type TrabajoFrecuenteRow = {
  descripcion: string | null;
  trabajoMasFrecuente: string | null;
};

function fechaCreacionBoundsForQuery(
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

const MESES = [
  "", "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export class EstadisticasManoDeObraService {
  async getTotalManoDeObra(
    from: Date | undefined,
    to: Date | undefined
  ): Promise<TotalManoDeObraRow[]> {
    const { gte, lte } = fechaCreacionBoundsForQuery(from, to);
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
      ${gte ? Prisma.sql`AND o.fechaCreacion >= ${gte}` : Prisma.empty}
      ${lte ? Prisma.sql`AND o.fechaCreacion <= ${lte}` : Prisma.empty};
    `;
  }

  async getTopManoDeObra(
    from: Date | undefined,
    to: Date | undefined
  ): Promise<TopManoDeObraRow[]> {
    const { gte, lte } = fechaCreacionBoundsForQuery(from, to);
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
      ${gte ? Prisma.sql`AND o.fechaCreacion >= ${gte}` : Prisma.empty}
      ${lte ? Prisma.sql`AND o.fechaCreacion <= ${lte}` : Prisma.empty}
      GROUP BY t.descripcion
      ORDER BY totalPorTrabajo DESC
      LIMIT 10;
    `;
  }

  async getTopPorFrecuencia(
    from: Date | undefined,
    to: Date | undefined
  ): Promise<TopManoDeObraRow[]> {
    const { gte, lte } = fechaCreacionBoundsForQuery(from, to);
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
      ${gte ? Prisma.sql`AND o.fechaCreacion >= ${gte}` : Prisma.empty}
      ${lte ? Prisma.sql`AND o.fechaCreacion <= ${lte}` : Prisma.empty}
      GROUP BY t.descripcion
      ORDER BY cantidadOrdenes DESC
      LIMIT 10;
    `;
  }

  async getEvolucionMensual(): Promise<
    { label: string; total: number; ordenes: number }[]
  > {
    const rows = await prisma.$queryRaw<EvolucionRow[]>`
      SELECT
        MONTH(o.fechaCreacion) AS mes,
        YEAR(o.fechaCreacion) AS anio,
        SUM(t.precioUnitario) AS total,
        COUNT(DISTINCT o.id) AS ordenes
      FROM OrdenReparacion o
      INNER JOIN TrabajoRealizado t
        ON o.id = t.ordenReparacionId
      WHERE o.estado = 'Terminado'
      AND t.descripcion != 'mo'
      AND t.descripcion != 'Mano de obra'
      AND o.fechaCreacion >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY anio, mes
      ORDER BY anio ASC, mes ASC;
    `;
    return rows.map((r) => ({
      label: `${MESES[Number(r.mes)]} ${Number(r.anio)}`,
      total: Number(r.total),
      ordenes: Number(r.ordenes),
    }));
  }

  async getTrabajoMasFrecuente(
    from: Date | undefined,
    to: Date | undefined
  ): Promise<string | null> {
    const { gte, lte } = fechaCreacionBoundsForQuery(from, to);
    const rows = await prisma.$queryRaw<TrabajoFrecuenteRow[]>`
      SELECT
        t.descripcion AS trabajoMasFrecuente
      FROM OrdenReparacion o
      INNER JOIN TrabajoRealizado t
        ON o.id = t.ordenReparacionId
      WHERE o.estado = 'Terminado'
      AND t.descripcion != 'mo'
      AND t.descripcion != 'Mano de obra'
      ${gte ? Prisma.sql`AND o.fechaCreacion >= ${gte}` : Prisma.empty}
      ${lte ? Prisma.sql`AND o.fechaCreacion <= ${lte}` : Prisma.empty}
      GROUP BY t.descripcion
      ORDER BY COUNT(*) DESC
      LIMIT 1;
    `;
    return rows.length > 0 ? (rows[0].trabajoMasFrecuente ?? null) : null;
  }
}
