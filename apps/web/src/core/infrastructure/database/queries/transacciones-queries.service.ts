import { prisma } from "@/core/infrastructure/database/prisma";

type TotalTransacciones = {
  total_transacciones: number;
};

export class TransaccionesQueriesService {
  constructor() {}

  async getCountTransaccionesByTipo(tipoDeOperacionId: number) {
    return await prisma.$queryRaw<TotalTransacciones[]>`
      SELECT SUM(cantidad) AS total_transacciones
      FROM (
        SELECT COUNT(*) AS cantidad FROM Gasto WHERE tipoOperacionId = ${tipoDeOperacionId}
        UNION ALL
        SELECT COUNT(*) FROM IngresoManualDeDinero WHERE tipoOperacionId = ${tipoDeOperacionId}
        UNION ALL
        SELECT COUNT(*) FROM IngresoPorVenta WHERE tipoOperacionId = ${tipoDeOperacionId}
        UNION ALL
        SELECT COUNT(*) FROM Extraccion WHERE tipoOperacionId = ${tipoDeOperacionId}
        UNION ALL
        SELECT COUNT(*) FROM IngresoPorReparacion WHERE tipoOperacionId = ${tipoDeOperacionId}
      ) AS t;
    `;
  }
}
