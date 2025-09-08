DROP VIEW IF EXISTS v_ventas_totales;

CREATE VIEW v_ventas_totales AS
WITH
-- Repuestos con recargo y redondeo
ru AS (
  SELECT
    r.ventaId,
    SUM( CEIL( r.precioVenta * (1 + v.porcentajeRecargo/100.0) / 500.0 ) * 500 ) AS total_repuestos
  FROM RepuestoUsado r
  JOIN Venta v ON v.id = r.ventaId
  WHERE r.ventaId IS NOT NULL
  GROUP BY r.ventaId
),
-- Reparaciones de terceros con recargo y redondeo
rt AS (
  SELECT
    r.ventaId,
    SUM( CEIL( (r.precioVenta) * (1 + v.porcentajeRecargo/100.0) / 500.0 ) * 500 ) AS total_terceros
  FROM ReparacionDeTercero r
  JOIN Venta v ON v.id = r.ventaId
  WHERE r.ventaId IS NOT NULL
  GROUP BY r.ventaId
),
-- Trabajos realizados con recargo y redondeo
tr AS (
  SELECT
    t.ventaId,
    SUM( t.precioUnitario ) AS total_trabajos
  FROM TrabajoRealizado t
  JOIN Venta v ON v.id = t.ventaId
  WHERE t.ventaId IS NOT NULL
  GROUP BY t.ventaId
),
-- Ingresos convertidos a ARS
ing AS (
  SELECT
    i.ventaId,
    SUM(
      CASE
        WHEN i.moneda = 'Peso'  THEN i.monto
        WHEN i.moneda = 'Dolar' THEN i.monto * d.blue
        ELSE 0
      END
    ) AS total_pagado_ars
  FROM IngresoPorVenta i
  LEFT JOIN Dolar d ON d.id = i.dolarId
  GROUP BY i.ventaId
)
SELECT
  v.id                           AS venta_id,
  v.fecha                        AS fecha,
  v.clienteId                    AS cliente_id,
  COALESCE(c.fullName, v.informacionCliente) AS cliente_nombre,
  c.phone						as cliente_phone,

  COALESCE(ru.total_repuestos,0) AS total_repuestos,
  COALESCE(rt.total_terceros,0)  AS total_terceros,
  COALESCE(tr.total_trabajos,0)  AS total_trabajos,
  COALESCE(ing.total_pagado_ars, 0) AS total_pagado_ars,

  -- Total final: suma de items (ya con recargo+redondeo) + incremento - descuento
  (
    COALESCE(ru.total_repuestos,0)
    + COALESCE(rt.total_terceros,0)
    + COALESCE(tr.total_trabajos,0)
    + COALESCE(v.incremento,0)
    - COALESCE(v.descuento,0)
  ) AS total_venta,
  -- Pendiente bruta
  (
    (
      COALESCE(ru.total_repuestos,0)
      + COALESCE(rt.total_terceros,0)
      + COALESCE(tr.total_trabajos,0)
      + COALESCE(v.incremento,0)
      - COALESCE(v.descuento,0)
    ) - COALESCE(ing.total_pagado_ars, 0)
  ) AS pendiente
FROM Venta v
LEFT JOIN Cliente c ON c.id = v.clienteId
LEFT JOIN ru ON ru.ventaId = v.id
LEFT JOIN rt ON rt.ventaId = v.id
LEFT JOIN tr ON tr.ventaId = v.id
LEFT JOIN ing ON ing.ventaId = v.id
WHERE v.estado <> 'Presupuestado'
ORDER BY v.fecha DESC, v.id;