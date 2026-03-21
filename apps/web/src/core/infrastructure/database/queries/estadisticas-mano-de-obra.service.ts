import { prisma } from "@/core/infrastructure/database/prisma";
import { getBuenosAiresDayRangeUtc, TURNOS_TIMEZONE } from "@/lib/turno-fecha-tz";
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

export class EstadisticasManoDeObraService {
  constructor() {}

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
}
