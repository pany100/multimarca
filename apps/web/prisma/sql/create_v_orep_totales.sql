DROP VIEW IF EXISTS v_orep_totales;

CREATE VIEW v_orep_totales AS
WITH
-- Repuestos: si recargo = 0 → no redondea
ru AS (
  SELECT
    r.ordenReparacionId,
    SUM(
      CASE
        WHEN oRep.porcentajeRecargo = 0 THEN r.precioVenta
        ELSE CEIL(r.precioVenta * (1 + oRep.porcentajeRecargo / 100.0) / 500.0) * 500
      END
    ) AS total_repuestos
  FROM RepuestoUsado r
  JOIN OrdenReparacion oRep ON oRep.id = r.ordenReparacionId
  WHERE r.ordenReparacionId IS NOT NULL
  GROUP BY r.ordenReparacionId
),

-- Reparaciones de terceros
rt AS (
  SELECT
    r.ordenReparacionId,
    SUM(
      CASE
        WHEN oRep.porcentajeRecargo = 0 THEN r.precioVenta
        ELSE CEIL(r.precioVenta * (1 + oRep.porcentajeRecargo / 100.0) / 500.0) * 500
      END
    ) AS total_terceros
  FROM ReparacionDeTercero r
  JOIN OrdenReparacion oRep ON oRep.id = r.ordenReparacionId
  WHERE r.ordenReparacionId IS NOT NULL
  GROUP BY r.ordenReparacionId
),

-- Trabajos realizados
tr AS (
  SELECT
    t.ordenReparacionId,
    SUM(
      t.precioUnitario
    ) AS total_trabajos
  FROM TrabajoRealizado t
  JOIN OrdenReparacion oRep ON oRep.id = t.ordenReparacionId
  WHERE t.ordenReparacionId IS NOT NULL
  GROUP BY t.ordenReparacionId
),

-- Ingresos convertidos a ARS
ing AS (
  SELECT
    i.ordenReparacionId,
    SUM(
      CASE
        WHEN i.moneda = 'Peso'  THEN i.monto
        WHEN i.moneda = 'Dolar' THEN i.monto * d.blue
        ELSE 0
      END
    ) AS total_pagado_ars
  FROM IngresoPorReparacion i
  LEFT JOIN Dolar d ON d.id = i.dolarId
  GROUP BY i.ordenReparacionId
)

SELECT
  oRep.id                           AS orden_reparacion_id,
  a.patent                          AS auto_patent,
  c.fullName                        AS cliente_nombre,
  c.id                              AS cliente_id,
  c.phone							AS cliente_phone,

  COALESCE(ru.total_repuestos,0)    AS total_repuestos,
  COALESCE(rt.total_terceros,0)     AS total_terceros,
  COALESCE(tr.total_trabajos,0)     AS total_trabajos,
  COALESCE(ing.total_pagado_ars, 0) AS total_pagado_ars,

  (
    COALESCE(ru.total_repuestos,0)
    + COALESCE(rt.total_terceros,0)
    + COALESCE(tr.total_trabajos,0)
    + COALESCE(oRep.incremento,0)
    + COALESCE(oRep.incrementoInterno,0)
    - COALESCE(oRep.descuento,0)
  ) AS total_reparacion,

  (
    (
      COALESCE(ru.total_repuestos,0)
      + COALESCE(rt.total_terceros,0)
      + COALESCE(tr.total_trabajos,0)
      + COALESCE(oRep.incremento,0)
      + COALESCE(oRep.incrementoInterno,0)
      - COALESCE(oRep.descuento,0)
    ) - COALESCE(ing.total_pagado_ars, 0)
  ) AS pendiente

FROM OrdenReparacion oRep
LEFT JOIN Auto a ON a.id = oRep.autoId
LEFT JOIN Cliente c ON c.id = a.ownerId
LEFT JOIN ru  ON ru.ordenReparacionId = oRep.id
LEFT JOIN rt  ON rt.ordenReparacionId = oRep.id
LEFT JOIN tr  ON tr.ordenReparacionId = oRep.id
LEFT JOIN ing ON ing.ordenReparacionId = oRep.id
WHERE oRep.estado <> 'Presupuestado';