-- Backfill: por cada Auto con cedulaVerdePath legacy y sin CustomFile asociado,
-- crear una fila en CustomFile en estado Listo apuntando a la URL existente.
-- El filtro LEFT JOIN ... WHERE cf.id IS NULL evita violar el @unique de
-- autoCedulaVerdeId y hace la operación idempotente.
INSERT INTO `CustomFile` (`tempPath`, `finalPath`, `status`, `promotedAt`, `createdAt`, `autoCedulaVerdeId`)
SELECT
  a.`cedulaVerdePath`,
  a.`cedulaVerdePath`,
  'Listo',
  NOW(3),
  NOW(3),
  a.`id`
FROM `Auto` a
LEFT JOIN `CustomFile` cf ON cf.`autoCedulaVerdeId` = a.`id`
WHERE a.`cedulaVerdePath` IS NOT NULL
  AND a.`cedulaVerdePath` <> ''
  AND cf.`id` IS NULL;

-- Drop legacy column. After backfill, todo se lee de Auto.cedulaVerdeFile.
ALTER TABLE `Auto` DROP COLUMN `cedulaVerdePath`;
