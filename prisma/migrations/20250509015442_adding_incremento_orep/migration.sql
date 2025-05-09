-- AlterTable
ALTER TABLE `OrdenReparacion` ADD COLUMN `descripcionIncremento` VARCHAR(255) NULL,
    ADD COLUMN `incremento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;
