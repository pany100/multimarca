/*
  Warnings:

  - Made the column `tipoOperacionId` on table `Extraccion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Extraccion` DROP FOREIGN KEY `Extraccion_tipoOperacionId_fkey`;

-- AlterTable
ALTER TABLE `Extraccion` MODIFY `tipoOperacionId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Extraccion` ADD CONSTRAINT `Extraccion_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
