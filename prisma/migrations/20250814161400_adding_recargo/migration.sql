-- AlterTable
ALTER TABLE `OrdenReparacion` ADD COLUMN `porcentajeRecargo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `Presupuesto` ADD COLUMN `porcentajeRecargo` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
