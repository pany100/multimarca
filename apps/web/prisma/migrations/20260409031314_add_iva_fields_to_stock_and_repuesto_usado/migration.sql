-- AlterTable
ALTER TABLE `RepuestoUsado` ADD COLUMN `iva` DOUBLE NULL;

-- AlterTable
ALTER TABLE `Stock` ADD COLUMN `buyIva` DOUBLE NULL,
    ADD COLUMN `sellIva` DOUBLE NULL;
