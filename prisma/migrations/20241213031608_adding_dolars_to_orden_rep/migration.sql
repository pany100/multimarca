-- AlterTable
ALTER TABLE `OrdenReparacion` ADD COLUMN `dolarId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrdenReparacion` ADD CONSTRAINT `OrdenReparacion_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
