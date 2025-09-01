/*
  Warnings:

  - A unique constraint covering the columns `[reciboORepId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reparacionDeTerceroId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CustomFile` ADD COLUMN `reciboORepId` INTEGER NULL,
    ADD COLUMN `reparacionDeTerceroId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_reciboORepId_key` ON `CustomFile`(`reciboORepId`);

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_reparacionDeTerceroId_key` ON `CustomFile`(`reparacionDeTerceroId`);

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_reciboORepId_fkey` FOREIGN KEY (`reciboORepId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_reparacionDeTerceroId_fkey` FOREIGN KEY (`reparacionDeTerceroId`) REFERENCES `ReparacionDeTercero`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
