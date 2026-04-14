-- Backfill: crear CustomFile (status Listo, finalPath seteado) para cada Empleado con dniImagePath existente.
-- Premisa: los valores actuales en Empleado.dniImagePath ya apuntan a ubicaciones finales en S3.
-- tempPath se llena con el mismo valor porque la columna es NOT NULL en CustomFile.
-- Idempotente: el NOT EXISTS evita duplicar si la migracion se reaplica.

INSERT INTO `CustomFile` (`tempPath`, `finalPath`, `status`, `empleadoDniFrenteId`, `promotedAt`)
SELECT
    `dniImagePath`,
    `dniImagePath`,
    'Listo',
    `id`,
    NOW()
FROM `Empleado` AS e
WHERE e.`dniImagePath` IS NOT NULL
  AND e.`dniImagePath` <> ''
  AND NOT EXISTS (
      SELECT 1 FROM `CustomFile` c WHERE c.`empleadoDniFrenteId` = e.`id`
  );
