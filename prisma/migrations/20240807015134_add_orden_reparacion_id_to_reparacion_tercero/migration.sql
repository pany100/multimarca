/*
  Warnings:

  - You are about to drop the `_OrdenReparacionReparacionTercero` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ordenReparacionId` to the `ReparacionDeTercero` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `_OrdenReparacionReparacionTercero` DROP FOREIGN KEY `_OrdenReparacionReparacionTercero_A_fkey`;

-- DropForeignKey
ALTER TABLE `_OrdenReparacionReparacionTercero` DROP FOREIGN KEY `_OrdenReparacionReparacionTercero_B_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

ALTER TABLE `ReparacionDeTercero` ADD COLUMN `ordenReparacionId` INTEGER;

UPDATE `ReparacionDeTercero` SET `ordenReparacionId` = 1 WHERE `ordenReparacionId` IS NULL;

-- AlterTable
ALTER TABLE `ReparacionDeTercero` MODIFY COLUMN `ordenReparacionId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `_OrdenReparacionReparacionTercero`;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
