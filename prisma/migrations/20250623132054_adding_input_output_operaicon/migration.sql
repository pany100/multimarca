-- AlterTable
ALTER TABLE `TipoDeOperacion` ADD COLUMN `esGasto` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `esIngreso` BOOLEAN NOT NULL DEFAULT true;
