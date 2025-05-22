-- AlterTable
ALTER TABLE `Presupuesto` ADD COLUMN `administrativoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_administrativoId_fkey` FOREIGN KEY (`administrativoId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
