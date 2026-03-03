import { prisma } from "@/core/infrastructure/database/prisma";

function dateToSql(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export class EstadisticasMecanicosQueriesService {
  async getMecanicosUsd(from: Date | null, to: Date | null) {
    if (from != null && to != null) {
      const fromStr = dateToSql(from);
      const toStr = dateToSql(to);
      return await prisma.$queryRaw`
        SELECT 
          orm.mecanicoId,
          e.name AS mecanicoNombre,
          YEARWEEK(orep.fechaSalidaReparacion, 1) AS semana,
          DATE_FORMAT(MIN(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaInicio,
          DATE_FORMAT(MAX(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaFin,
          SUM(tr.precioUnitario / COALESCE(d.blue,1)) AS ganancia
        FROM OrdenReparacion orep
        JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
        JOIN Empleado e ON e.id = orm.mecanicoId
        LEFT JOIN Dolar d ON d.id = orep.dolarId
        JOIN TrabajoRealizado tr ON tr.ordenReparacionId = orep.id
        WHERE orep.estado = 'Terminado'
          AND orep.fechaSalidaReparacion >= ${fromStr}
          AND orep.fechaSalidaReparacion <= ${toStr}
          AND (SELECT COUNT(*) FROM OrdenReparacionMecanico suborm WHERE suborm.ordenReparacionId = orep.id) = 1
        GROUP BY orm.mecanicoId, e.name, YEARWEEK(orep.fechaSalidaReparacion, 1)
        ORDER BY mecanicoId, semana;
      `;
    }

    return await prisma.$queryRaw`
      SELECT 
        orm.mecanicoId,
        e.name AS mecanicoNombre,
        YEARWEEK(orep.fechaSalidaReparacion, 1) AS semana,
        DATE_FORMAT(MIN(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaInicio,
        DATE_FORMAT(MAX(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaFin,
        SUM(tr.precioUnitario / COALESCE(d.blue,1)) AS ganancia
      FROM OrdenReparacion orep
      JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
      JOIN Empleado e ON e.id = orm.mecanicoId
      LEFT JOIN Dolar d ON d.id = orep.dolarId
      JOIN TrabajoRealizado tr ON tr.ordenReparacionId = orep.id
      WHERE orep.estado = 'Terminado'
        AND orep.fechaSalidaReparacion >= DATE_SUB(CURDATE(), INTERVAL 70 DAY)
        AND (SELECT COUNT(*) FROM OrdenReparacionMecanico suborm WHERE suborm.ordenReparacionId = orep.id) = 1
      GROUP BY orm.mecanicoId, e.name, YEARWEEK(orep.fechaSalidaReparacion, 1)
      ORDER BY mecanicoId, semana;
    `;
  }

  async getMecanicosArs(from: Date | null, to: Date | null) {
    if (from != null && to != null) {
      const fromStr = dateToSql(from);
      const toStr = dateToSql(to);
      return await prisma.$queryRaw`
        SELECT 
          orm.mecanicoId,
          e.name AS mecanicoNombre,
          YEARWEEK(orep.fechaSalidaReparacion, 1) AS semana,
          DATE_FORMAT(MIN(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaInicio,
          DATE_FORMAT(MAX(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaFin,
          SUM(tr.precioUnitario) AS ganancia
        FROM OrdenReparacion orep
        JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
        JOIN Empleado e ON e.id = orm.mecanicoId
        LEFT JOIN Dolar d ON d.id = orep.dolarId
        JOIN TrabajoRealizado tr ON tr.ordenReparacionId = orep.id
        WHERE orep.estado = 'Terminado'
          AND orep.fechaSalidaReparacion >= ${fromStr}
          AND orep.fechaSalidaReparacion <= ${toStr}
          AND (SELECT COUNT(*) FROM OrdenReparacionMecanico suborm WHERE suborm.ordenReparacionId = orep.id) = 1
        GROUP BY orm.mecanicoId, e.name, YEARWEEK(orep.fechaSalidaReparacion, 1)
        ORDER BY mecanicoId, semana;
      `;
    }

    return await prisma.$queryRaw`
      SELECT 
        orm.mecanicoId,
        e.name AS mecanicoNombre,
        YEARWEEK(orep.fechaSalidaReparacion, 1) AS semana,
        DATE_FORMAT(MIN(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaInicio,
        DATE_FORMAT(MAX(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaFin,
        SUM(tr.precioUnitario) AS ganancia
      FROM OrdenReparacion orep
      JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
      JOIN Empleado e ON e.id = orm.mecanicoId
      LEFT JOIN Dolar d ON d.id = orep.dolarId
      JOIN TrabajoRealizado tr ON tr.ordenReparacionId = orep.id
      WHERE orep.estado = 'Terminado'
        AND orep.fechaSalidaReparacion >= DATE_SUB(CURDATE(), INTERVAL 70 DAY)
        AND (SELECT COUNT(*) FROM OrdenReparacionMecanico suborm WHERE suborm.ordenReparacionId = orep.id) = 1
      GROUP BY orm.mecanicoId, e.name, YEARWEEK(orep.fechaSalidaReparacion, 1)
      ORDER BY mecanicoId, semana;
    `;
  }
}
