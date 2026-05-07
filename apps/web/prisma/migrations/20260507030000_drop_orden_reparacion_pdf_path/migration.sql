-- Backfill: por cada OdR con pdfPath legacy y sin scannerFile asociado, crear
-- una fila en CustomFile en estado Listo apuntando a la URL existente. La FK
-- ordenReparacionId tiene constraint @unique, y el LEFT JOIN ... WHERE cf.id IS NULL
-- garantiza idempotencia y evita violar el constraint.
INSERT INTO `CustomFile` (`tempPath`, `finalPath`, `status`, `promotedAt`, `createdAt`, `ordenReparacionId`)
SELECT
  o.`pdfPath`,
  o.`pdfPath`,
  'Listo',
  NOW(3),
  NOW(3),
  o.`id`
FROM `OrdenReparacion` o
LEFT JOIN `CustomFile` cf ON cf.`ordenReparacionId` = o.`id`
WHERE o.`pdfPath` IS NOT NULL
  AND o.`pdfPath` <> ''
  AND cf.`id` IS NULL;

-- Drop legacy column. Output ya se servía desde scannerFile (use cases lo
-- sobreescribían en el spread), y el create mapper ahora también escribe a
-- scannerFile. Las OdR con double-write previo conservan la URL en CustomFile.
ALTER TABLE `OrdenReparacion` DROP COLUMN `pdfPath`;
