/*
  Warnings:

  - Made the column `usuarioId` on table `IngresoManualDeDinero` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `IngresoManualDeDinero` DROP FOREIGN KEY `IngresoManualDeDinero_usuarioId_fkey`;

-- AlterTable
ALTER TABLE `IngresoManualDeDinero` ALTER COLUMN `tipoExtraccion` DROP DEFAULT,
    MODIFY `usuarioId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
