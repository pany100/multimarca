/*
  Warnings:

  - Made the column `administrativoId` on table `Presupuesto` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Presupuesto` DROP FOREIGN KEY `Presupuesto_administrativoId_fkey`;

-- AlterTable
ALTER TABLE `Presupuesto` MODIFY `administrativoId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_administrativoId_fkey` FOREIGN KEY (`administrativoId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
