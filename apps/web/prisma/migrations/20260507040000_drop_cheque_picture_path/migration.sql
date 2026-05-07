-- Add chequeFotoId column on CustomFile (FK que apunta a Cheque, @unique para
-- garantizar 1:1).
ALTER TABLE `CustomFile`
  ADD COLUMN `chequeFotoId` INT NULL,
  ADD UNIQUE INDEX `CustomFile_chequeFotoId_key` (`chequeFotoId`),
  ADD CONSTRAINT `CustomFile_chequeFotoId_fkey`
    FOREIGN KEY (`chequeFotoId`) REFERENCES `Cheque`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: por cada Cheque con picturePath y sin CustomFile asociado, crear
-- una fila en CustomFile en estado Listo apuntando a la URL existente.
-- LEFT JOIN ... WHERE cf.id IS NULL garantiza idempotencia.
INSERT INTO `CustomFile` (`tempPath`, `finalPath`, `status`, `promotedAt`, `createdAt`, `chequeFotoId`)
SELECT
  c.`picturePath`,
  c.`picturePath`,
  'Listo',
  NOW(3),
  NOW(3),
  c.`id`
FROM `Cheque` c
LEFT JOIN `CustomFile` cf ON cf.`chequeFotoId` = c.`id`
WHERE c.`picturePath` IS NOT NULL
  AND c.`picturePath` <> ''
  AND cf.`id` IS NULL;

-- Drop legacy column. Después de esto, todo lo de cheques pasa por CustomFile
-- (creación, edición, lectura). El cron s3FileSync promueve tmp/<uuid> a
-- cheques/<uuid> y limpia archivos huérfanos.
ALTER TABLE `Cheque` DROP COLUMN `picturePath`;
