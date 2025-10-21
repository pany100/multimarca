-- AlterTable
ALTER TABLE `Extraccion` ADD COLUMN `gastosArba` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Gasto` ADD COLUMN `gastosArba` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `IngresoManualDeDinero` ADD COLUMN `gastosArba` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `IngresoPorReparacion` ADD COLUMN `gastosArba` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `IngresoPorVenta` ADD COLUMN `gastosArba` DECIMAL(10, 2) NOT NULL DEFAULT 0;
