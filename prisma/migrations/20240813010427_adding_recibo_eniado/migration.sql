-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `IngresoPorReparacion` ADD COLUMN `reciboEnviado` BOOLEAN NOT NULL DEFAULT false;
