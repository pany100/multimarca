-- DropForeignKey
ALTER TABLE `Presupuesto` DROP FOREIGN KEY `Presupuesto_autoId_fkey`;

-- AlterTable
ALTER TABLE `Presupuesto` MODIFY `autoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
