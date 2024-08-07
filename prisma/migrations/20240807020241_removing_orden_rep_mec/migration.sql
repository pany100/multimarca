/*
  Warnings:

  - You are about to drop the `_OrdenReparacionMecanicos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_OrdenReparacionMecanicos` DROP FOREIGN KEY `_OrdenReparacionMecanicos_A_fkey`;

-- DropForeignKey
ALTER TABLE `_OrdenReparacionMecanicos` DROP FOREIGN KEY `_OrdenReparacionMecanicos_B_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- DropTable
DROP TABLE `_OrdenReparacionMecanicos`;

-- CreateTable
CREATE TABLE `OrdenReparacionMecanico` (
    `ordenReparacionId` INTEGER NOT NULL,
    `mecanicoId` INTEGER NOT NULL,

    PRIMARY KEY (`ordenReparacionId`, `mecanicoId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrdenReparacionMecanico` ADD CONSTRAINT `OrdenReparacionMecanico_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenReparacionMecanico` ADD CONSTRAINT `OrdenReparacionMecanico_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Mecanico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
