import { prisma } from "@/core/infrastructure/database/prisma";

function dateToSql(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export interface MecanicoRow {
  mecanicoId: number;
  mecanicoNombre: string;
  semanaInicio: string;
  semanaFin: string;
  ganancia: number;
  cantidadOrdenes: number;
}

export interface OrdenCompartida {
  ordenId: number;
  fechaSalida: string;
  manoDeObraConIva: number;
  mecanicos: string;
}

export class EstadisticasMecanicosQueriesService {
  /** Mano de obra con IVA, incluyendo reparaciones compartidas (100% a cada mecánico). */
  async getMecanicosArs(from: Date | null, to: Date | null): Promise<MecanicoRow[]> {
    const dateFilter = from != null && to != null
      ? `AND orep.fechaSalidaReparacion >= '${dateToSql(from)}' AND orep.fechaSalidaReparacion <= '${dateToSql(to)}'`
      : `AND orep.fechaSalidaReparacion >= DATE_SUB(CURDATE(), INTERVAL 70 DAY)`;

    return await prisma.$queryRawUnsafe<MecanicoRow[]>(`
      SELECT
        orm.mecanicoId,
        e.name AS mecanicoNombre,
        YEARWEEK(orep.fechaSalidaReparacion, 1) AS semana,
        DATE_FORMAT(MIN(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaInicio,
        DATE_FORMAT(MAX(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaFin,
        SUM(CEIL(tr.precioUnitario * (1 + COALESCE(tr.iva, 0) / 100))) AS ganancia,
        COUNT(DISTINCT orep.id) AS cantidadOrdenes
      FROM OrdenReparacion orep
      JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
      JOIN Empleado e ON e.id = orm.mecanicoId
      JOIN TrabajoRealizado tr ON tr.ordenReparacionId = orep.id
      WHERE orep.estado = 'Terminado'
        ${dateFilter}
      GROUP BY orm.mecanicoId, e.name, YEARWEEK(orep.fechaSalidaReparacion, 1)
      ORDER BY mecanicoId, semana;
    `);
  }

  async getMecanicosUsd(from: Date | null, to: Date | null): Promise<MecanicoRow[]> {
    const dateFilter = from != null && to != null
      ? `AND orep.fechaSalidaReparacion >= '${dateToSql(from)}' AND orep.fechaSalidaReparacion <= '${dateToSql(to)}'`
      : `AND orep.fechaSalidaReparacion >= DATE_SUB(CURDATE(), INTERVAL 70 DAY)`;

    return await prisma.$queryRawUnsafe<MecanicoRow[]>(`
      SELECT
        orm.mecanicoId,
        e.name AS mecanicoNombre,
        YEARWEEK(orep.fechaSalidaReparacion, 1) AS semana,
        DATE_FORMAT(MIN(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaInicio,
        DATE_FORMAT(MAX(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaFin,
        SUM(CEIL(tr.precioUnitario * (1 + COALESCE(tr.iva, 0) / 100)) / COALESCE(d.blue, 1)) AS ganancia,
        COUNT(DISTINCT orep.id) AS cantidadOrdenes
      FROM OrdenReparacion orep
      JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
      JOIN Empleado e ON e.id = orm.mecanicoId
      LEFT JOIN Dolar d ON d.id = orep.dolarId
      JOIN TrabajoRealizado tr ON tr.ordenReparacionId = orep.id
      WHERE orep.estado = 'Terminado'
        ${dateFilter}
      GROUP BY orm.mecanicoId, e.name, YEARWEEK(orep.fechaSalidaReparacion, 1)
      ORDER BY mecanicoId, semana;
    `);
  }

  /** Órdenes con más de un mecánico asignado en el período. */
  async getOrdenesCompartidas(from: Date | null, to: Date | null): Promise<OrdenCompartida[]> {
    const dateFilter = from != null && to != null
      ? `AND orep.fechaSalidaReparacion >= '${dateToSql(from)}' AND orep.fechaSalidaReparacion <= '${dateToSql(to)}'`
      : `AND orep.fechaSalidaReparacion >= DATE_SUB(CURDATE(), INTERVAL 70 DAY)`;

    return await prisma.$queryRawUnsafe<OrdenCompartida[]>(`
      SELECT
        orep.id AS ordenId,
        DATE_FORMAT(orep.fechaSalidaReparacion, '%Y-%m-%d') AS fechaSalida,
        SUM(CEIL(tr.precioUnitario * (1 + COALESCE(tr.iva, 0) / 100))) AS manoDeObraConIva,
        GROUP_CONCAT(DISTINCT e.name ORDER BY e.name SEPARATOR ', ') AS mecanicos
      FROM OrdenReparacion orep
      JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
      JOIN Empleado e ON e.id = orm.mecanicoId
      JOIN TrabajoRealizado tr ON tr.ordenReparacionId = orep.id
      WHERE orep.estado = 'Terminado'
        ${dateFilter}
      GROUP BY orep.id, orep.fechaSalidaReparacion
      HAVING COUNT(DISTINCT orm.mecanicoId) > 1
      ORDER BY orep.fechaSalidaReparacion DESC;
    `);
  }
}
