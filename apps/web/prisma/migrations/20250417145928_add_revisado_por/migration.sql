-- AlterTable
ALTER TABLE `OrdenReparacion` ADD COLUMN `revisadoPorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrdenReparacion` ADD CONSTRAINT `OrdenReparacion_revisadoPorId_fkey` FOREIGN KEY (`revisadoPorId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
