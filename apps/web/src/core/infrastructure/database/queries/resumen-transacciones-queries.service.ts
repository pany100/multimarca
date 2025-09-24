import { ResumenTransaccionesVO } from "@/core/domain/value-objects/resumen-transacciones.vo";
import { prisma } from "@/core/infrastructure/database/prisma";
import { sqlRawPaged } from "@/shared/utils/pagination";

export class ResumenTransaccionesQueriesService {
  async getResumenTransacciones(resumenObject: ResumenTransaccionesVO) {
    const transaccionesQuery = `
      WITH transacciones AS (
        -- IngresoManualDeDinero
        SELECT 
          i.id,
          i.fecha,
          i.monto,
          i.descripcion,
          'IngresoManualDeDinero' AS tipo,
          'Usuario' AS entidad,
          i.usuarioId AS entidadId,
          i.tipoOperacionId,
          t.label AS tipoOperacion,
          u.fullName AS detalleEntidad,
          i.moneda,
          i.revisado
        FROM IngresoManualDeDinero i
        INNER JOIN Usuario u ON u.id = i.usuarioId
        LEFT JOIN TipoDeOperacion t ON t.id = i.tipoOperacionId

        UNION ALL

        -- IngresoPorVenta
        SELECT 
          i.id,
          i.fecha,
          i.monto,
          i.descripcion,
          'IngresoPorVenta' AS tipo,
          'Cliente' AS entidad,
          i.clienteId AS entidadId,
          i.tipoOperacionId,
          t.label AS tipoOperacion,
          COALESCE(c.fullName, i.informacionCliente) AS detalleEntidad,
          i.moneda,
          i.revisado
        FROM IngresoPorVenta i
        LEFT JOIN Cliente c ON c.id = i.clienteId
        LEFT JOIN TipoDeOperacion t ON t.id = i.tipoOperacionId

        UNION ALL

        -- IngresoPorReparacion
        SELECT 
          i.id,
          i.fecha,
          i.monto,
          i.descripcion,
          'IngresoPorReparacion' AS tipo,
          'Cliente' AS entidad,
          i.clienteId AS entidadId,
          i.tipoOperacionId,
          t.label AS tipoOperacion,
          c.fullName AS detalleEntidad,
          i.moneda,
          i.revisado
        FROM IngresoPorReparacion i
        INNER JOIN Cliente c ON c.id = i.clienteId
        LEFT JOIN TipoDeOperacion t ON t.id = i.tipoOperacionId

        UNION ALL

        -- Gasto
        SELECT 
          g.id,
          g.fecha,
          g.precio AS monto,
          COALESCE(g.detalle, g.nombre) AS descripcion,
          'Gasto' AS tipo,
          IF(g.proveedorId IS NOT NULL, 'Proveedor', 'Categoría') AS entidad,
          COALESCE(g.proveedorId, g.categoriaId) AS entidadId,
          g.tipoOperacionId,
          t.label AS tipoOperacion,
          COALESCE(p.name, c.nombre) AS detalleEntidad,
          g.moneda,
          g.revisado
        FROM Gasto g
        LEFT JOIN Proveedor p ON p.id = g.proveedorId
        LEFT JOIN CategoriaGasto c ON c.id = g.categoriaId
        LEFT JOIN TipoDeOperacion t ON t.id = g.tipoOperacionId

        UNION ALL

        -- Extraccion
        SELECT 
          e.id,
          e.fecha,
          e.monto,
          e.motivo AS descripcion,
          'Extraccion' AS tipo,
          'Usuario' AS entidad,
          e.usuarioId AS entidadId,
          e.tipoOperacionId,
          t.label AS tipoOperacion,
          u.fullName AS detalleEntidad,
          e.moneda,
          e.revisado
        FROM Extraccion e
        INNER JOIN Usuario u ON u.id = e.usuarioId
        LEFT JOIN TipoDeOperacion t ON t.id = e.tipoOperacionId
      )
      SELECT *
      FROM transacciones
      WHERE ( ${
        resumenObject.dateRange.from
          ? `fecha >= '${resumenObject.dateRange.from}'`
          : "1=1"
      } )
        AND ( ${
          resumenObject.dateRange.to
            ? `fecha <= '${resumenObject.dateRange.to} 23:59:59'`
            : "1=1"
        } )
        AND ( ${
          resumenObject.tipoOperacionId
            ? `tipoOperacionId = ${resumenObject.tipoOperacionId}`
            : "1=1"
        } )
        AND (
              ${
                resumenObject.query
                  ? `
                CAST(id AS CHAR) LIKE '%${resumenObject.query}%' OR
                LOWER(entidad) LIKE LOWER('%${resumenObject.query}%') OR
                LOWER(descripcion) LIKE LOWER('%${resumenObject.query}%')
              `
                  : "1=1"
              }
            )
      ORDER BY fecha DESC
    `;
    const countQuery = `
  WITH transacciones AS (
    -- misma estructura simplificada solo para contar
    SELECT i.id, i.fecha, i.tipoOperacionId, i.descripcion, 'IngresoManualDeDinero' AS tipo, 'Usuario' AS entidad
    FROM IngresoManualDeDinero i
    UNION ALL
    SELECT i.id, i.fecha, i.tipoOperacionId, i.descripcion, 'IngresoPorVenta', 'Cliente'
    FROM IngresoPorVenta i
    UNION ALL
    SELECT i.id, i.fecha, i.tipoOperacionId, i.descripcion, 'IngresoPorReparacion', 'Cliente'
    FROM IngresoPorReparacion i
    UNION ALL
    SELECT g.id, g.fecha, g.tipoOperacionId, g.detalle, 'Gasto', 'Proveedor'
    FROM Gasto g
    UNION ALL
    SELECT e.id, e.fecha, e.tipoOperacionId, e.motivo, 'Extraccion', 'Usuario'
    FROM Extraccion e
  )
  SELECT COUNT(*) AS count
  FROM transacciones
  WHERE ( ${
    resumenObject.dateRange.from
      ? `fecha >= '${resumenObject.dateRange.from}'`
      : "1=1"
  } )
    AND ( ${
      resumenObject.dateRange.to
        ? `fecha <= '${resumenObject.dateRange.to} 23:59:59'`
        : "1=1"
    } )
    AND ( ${
      resumenObject.tipoOperacionId
        ? `tipoOperacionId = ${resumenObject.tipoOperacionId}`
        : "1=1"
    } )
    AND (
          ${
            resumenObject.query
              ? `
            CAST(id AS CHAR) LIKE '%${resumenObject.query}%' OR
            LOWER(entidad) LIKE LOWER('%${resumenObject.query}%') OR
            LOWER(descripcion) LIKE LOWER('%${resumenObject.query}%')
          `
              : "1=1"
          }
        )
`;

    return sqlRawPaged(
      prisma,
      transaccionesQuery,
      countQuery,
      resumenObject.page,
      resumenObject.size
    );
  }
}
