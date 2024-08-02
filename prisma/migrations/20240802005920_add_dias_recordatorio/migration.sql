-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `TrabajoRealizado` ADD COLUMN `diasParaRecordatorio` INTEGER NULL;
