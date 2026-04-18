-- AlterTable
ALTER TABLE `OrdenReparacion` ADD COLUMN `descuentoParaManoDeObra` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `Venta` ADD COLUMN `descuentoParaManoDeObra` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
