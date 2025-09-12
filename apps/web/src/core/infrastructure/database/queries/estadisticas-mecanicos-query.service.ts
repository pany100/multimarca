import { prisma } from "@/core/infrastructure/database/prisma";

export class EstadisticasMecanicosQueriesService {
  async getMecanicosUsd() {
    return await prisma.$queryRaw`
      SELECT 
        orm.mecanicoId,
        e.name AS mecanicoNombre,
        YEARWEEK(orep.fechaSalidaReparacion, 6) AS semana,
        DATE_FORMAT(MIN(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaInicio,
        DATE_FORMAT(MAX(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaFin,
        SUM(
          tr.precioUnitario / COALESCE(d.blue,1)
        ) AS ganancia
      FROM OrdenReparacion orep
      JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
      JOIN Empleado e ON e.id = orm.mecanicoId
      LEFT JOIN Dolar d ON d.id = orep.dolarId
      JOIN TrabajoRealizado tr ON tr.ordenReparacionId = orep.id
      WHERE orep.estado = 'Terminado'
        AND orep.fechaSalidaReparacion >= DATE_SUB(CURDATE(), INTERVAL 70 DAY) -- hace 10 semanas
        AND (
          SELECT COUNT(*) 
          FROM OrdenReparacionMecanico suborm 
          WHERE suborm.ordenReparacionId = orep.id
        ) = 1
      GROUP BY orm.mecanicoId, e.name, YEARWEEK(orep.fechaSalidaReparacion, 1)
      ORDER BY mecanicoId, semana;
    `;
  }

  async getMecanicosArs() {
    return await prisma.$queryRaw`
      SELECT 
        orm.mecanicoId,
        e.name AS mecanicoNombre,
        YEARWEEK(orep.fechaSalidaReparacion, 6) AS semana,
        DATE_FORMAT(MIN(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaInicio,
        DATE_FORMAT(MAX(orep.fechaSalidaReparacion), '%Y-%m-%d') AS semanaFin,
        SUM(
          tr.precioUnitario
        ) AS ganancia
      FROM OrdenReparacion orep
      JOIN OrdenReparacionMecanico orm ON orm.ordenReparacionId = orep.id
      JOIN Empleado e ON e.id = orm.mecanicoId
      LEFT JOIN Dolar d ON d.id = orep.dolarId
      JOIN TrabajoRealizado tr ON tr.ordenReparacionId = orep.id
      WHERE orep.estado = 'Terminado'
        AND orep.fechaSalidaReparacion >= DATE_SUB(CURDATE(), INTERVAL 70 DAY) -- hace 10 semanas
        AND (
          SELECT COUNT(*) 
          FROM OrdenReparacionMecanico suborm 
          WHERE suborm.ordenReparacionId = orep.id
        ) = 1
      GROUP BY orm.mecanicoId, e.name, YEARWEEK(orep.fechaSalidaReparacion, 1)
      ORDER BY mecanicoId, semana;
    `;
  }
}
