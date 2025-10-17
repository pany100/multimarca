-- AlterTable
ALTER TABLE `Extraccion` ADD COLUMN `cotizacionDolar` DECIMAL(10, 2) NULL,
    ADD COLUMN `gastosBancarios` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Gasto` ADD COLUMN `cotizacionDolar` DECIMAL(10, 2) NULL,
    ADD COLUMN `gastosBancarios` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `IngresoManualDeDinero` ADD COLUMN `cotizacionDolar` DECIMAL(10, 2) NULL,
    ADD COLUMN `gastosBancarios` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `IngresoPorReparacion` ADD COLUMN `cotizacionDolar` DECIMAL(10, 2) NULL,
    ADD COLUMN `gastosBancarios` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `IngresoPorVenta` ADD COLUMN `cotizacionDolar` DECIMAL(10, 2) NULL,
    ADD COLUMN `gastosBancarios` DECIMAL(10, 2) NOT NULL DEFAULT 0;
