-- AlterTable: agregar errorMessage + lastErrorAt para poder diagnosticar
-- filas en estado Error / ErrorAlSubir / ErrorAlBorrar sin cruzar con logs.
ALTER TABLE `CustomFile`
  ADD COLUMN `errorMessage` TEXT NULL,
  ADD COLUMN `lastErrorAt` DATETIME(3) NULL;
