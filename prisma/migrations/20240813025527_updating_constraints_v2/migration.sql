-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `RepuestoUsado` MODIFY `ordenReparacionId` INTEGER NULL;
