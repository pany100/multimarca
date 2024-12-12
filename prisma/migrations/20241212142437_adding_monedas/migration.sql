-- AlterTable
ALTER TABLE `Extraccion` ADD COLUMN `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso';

-- AlterTable
ALTER TABLE `Gasto` ADD COLUMN `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso';
