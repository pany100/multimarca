-- DropForeignKey
ALTER TABLE `Presupuesto` DROP FOREIGN KEY `Presupuesto_administrativoId_fkey`;

-- AlterTable
ALTER TABLE `Presupuesto` MODIFY `administrativoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_administrativoId_fkey` FOREIGN KEY (`administrativoId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
