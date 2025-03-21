-- AlterTable
ALTER TABLE `Extraccion` ADD COLUMN `chequeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Gasto` ADD COLUMN `chequeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `IngresoManualDeDinero` ADD COLUMN `chequeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `IngresoPorReparacion` ADD COLUMN `chequeId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Venta` ADD COLUMN `chequeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Extraccion` ADD CONSTRAINT `Extraccion_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
