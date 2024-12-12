-- AlterTable
ALTER TABLE `Extraccion` ADD COLUMN `dolarId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Gasto` ADD COLUMN `dolarId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Extraccion` ADD CONSTRAINT `Extraccion_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
