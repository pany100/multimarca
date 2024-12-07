-- AlterTable
ALTER TABLE `IngresoPorReparacion` ADD COLUMN `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso';
