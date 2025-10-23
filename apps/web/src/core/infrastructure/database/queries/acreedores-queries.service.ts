import { prisma } from "@/core/infrastructure/database/prisma";
import { sqlRawPaged } from "@/shared/utils/pagination";

type AcreedoresQueryParams = {
  page: number;
  size: number;
  query: string;
  from?: Date;
  to?: Date;
};

export class AcreedoresQueriesService {
  async listTopAcreedores({
    page,
    size,
    query = "",
    from,
    to,
  }: AcreedoresQueryParams): Promise<any> {
    const acreedoresQuery = `
      WITH acreedores AS (
        -- Acreedores de ventas (pagos de más)
        SELECT
          cliente_id,
          null as patente,
          cliente_nombre,
          cliente_phone,
          ABS(pendiente) as credito
        FROM v_ventas_totales
        WHERE pendiente < 0
          AND (LOWER(cliente_nombre) LIKE LOWER('%${query}%'))
          AND estado = 'Entregado'
          ${from ? `AND fecha >= '${from.toISOString()}'` : ""}
          ${to ? `AND fecha <= '${to.toISOString()}'` : ""}
        UNION ALL

        -- Acreedores de órdenes (pagos de más)
        SELECT
          cliente_id,
          auto_patent as patente,
          cliente_nombre,
          cliente_phone,
          ABS(pendiente) as credito
        FROM v_orep_totales
        WHERE pendiente < 0
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
        SUM(credito)                   AS credito_total
      FROM acreedores
      GROUP BY cliente_id
      ORDER BY credito_total DESC
    `;
    return sqlRawPaged(
      prisma,
      acreedoresQuery,
      `
      WITH acreedores AS (
        -- Acreedores de ventas
        SELECT
          cliente_id
        FROM v_ventas_totales
        WHERE pendiente < 0
          AND (LOWER(cliente_nombre) LIKE LOWER('%${query}%'))
          AND estado = 'Entregado'
          ${from ? `AND fecha >= '${from.toISOString()}'` : ""}
          ${to ? `AND fecha <= '${to.toISOString()}'` : ""}
        UNION ALL

        -- Acreedores de órdenes
        SELECT
          cliente_id
        FROM v_orep_totales
        WHERE pendiente < 0
          AND (LOWER(cliente_nombre) LIKE LOWER('%${query}%')
              OR LOWER(auto_patent) LIKE LOWER('%${query}%'))
          AND estado = 'Terminado'
          ${from ? `AND fecha >= '${from.toISOString()}'` : ""}
          ${to ? `AND fecha <= '${to.toISOString()}'` : ""}
      )
      SELECT
        COUNT(*) as count 
      FROM acreedores
      `,
      page,
      size
    );
  }
}
