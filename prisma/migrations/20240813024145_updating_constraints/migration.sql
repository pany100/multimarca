-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `ReparacionDeTercero` MODIFY `ordenReparacionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TrabajoRealizado` MODIFY `ordenReparacionId` INTEGER NULL;
