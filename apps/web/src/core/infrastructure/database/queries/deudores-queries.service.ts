import { prisma } from "@/core/infrastructure/database/prisma";
import { sqlRawPaged } from "@/shared/utils/pagination";

type DeudoresQueryParams = {
  page: number;
  size: number;
  query: string;
  from?: Date;
  to?: Date;
};

export class DeudoresQueriesService {
  async listTopDeudores({
    page,
    size,
    query = "",
    from,
    to,
  }: DeudoresQueryParams): Promise<any> {
    const deudaQuery = `
      WITH deudas AS (
        -- Deudas de ventas
        SELECT
          cliente_id,
          null as patente,
          cliente_nombre,
          cliente_phone,
          pendiente
        FROM v_ventas_totales
        WHERE pendiente > 0
          AND (LOWER(cliente_nombre) LIKE LOWER('%${query}%'))
          AND estado = 'Entregado'
          ${from ? `AND fecha >= '${from.toISOString()}'` : ""}
          ${to ? `AND fecha <= '${to.toISOString()}'` : ""}
        UNION ALL

        -- Deudas de órdenes
        SELECT
          cliente_id,
          auto_patent as patente,
          cliente_nombre,
          cliente_phone,
          pendiente
        FROM v_orep_totales
        WHERE pendiente > 0
          AND (LOWER(cliente_nombre) LIKE LOWER('%${query}%')
              OR LOWER(auto_patent) LIKE LOWER('%${query}%'))
          AND estado = 'Terminado'
          ${from ? `AND fecha >= '${from.toISOString()}'` : ""}
          ${to ? `AND fecha <= '${to.toISOString()}'` : ""}
      )
      SELECT
        COALESCE(cliente_id, -1)       AS id,
        patente,
        MAX(cliente_nombre)            AS cliente_nombre,
        MAX(cliente_phone)             AS cliente_phone,
        SUM(pendiente)                 AS deuda_total
      FROM deudas
      GROUP BY cliente_id
      ORDER BY deuda_total DESC
    `;
    return sqlRawPaged(
      prisma,
      deudaQuery,
      `
      WITH deudas AS (
        -- Deudas de ventas
        SELECT
          cliente_id
        FROM v_ventas_totales
        WHERE pendiente > 0
          AND (LOWER(cliente_nombre) LIKE LOWER('%${query}%'))
          AND estado = 'Entregado'
          ${from ? `AND fecha >= '${from.toISOString()}'` : ""}
          ${to ? `AND fecha <= '${to.toISOString()}'` : ""}
        UNION ALL

        -- Deudas de órdenes
        SELECT
          cliente_id
        FROM v_orep_totales
        WHERE pendiente > 0
          AND (LOWER(cliente_nombre) LIKE LOWER('%${query}%')
              OR LOWER(auto_patent) LIKE LOWER('%${query}%'))
          AND estado = 'Terminado'
          ${from ? `AND fecha >= '${from.toISOString()}'` : ""}
          ${to ? `AND fecha <= '${to.toISOString()}'` : ""}
      )
      SELECT
        COUNT(*) as count 
      FROM deudas
      `,
      page,
      size
    );
  }
}
