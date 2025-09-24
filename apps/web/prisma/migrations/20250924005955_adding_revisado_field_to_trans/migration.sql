-- AlterTable
ALTER TABLE `Extraccion` ADD COLUMN `revisado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Gasto` ADD COLUMN `revisado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `IngresoManualDeDinero` ADD COLUMN `revisado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `IngresoPorReparacion` ADD COLUMN `revisado` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `IngresoPorVenta` ADD COLUMN `revisado` BOOLEAN NOT NULL DEFAULT false;
