/*
  Warnings:

  - A unique constraint covering the columns `[empleadoLicenciaDorsoId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CustomFile` ADD COLUMN `empleadoLicenciaDorsoId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_empleadoLicenciaDorsoId_key` ON `CustomFile`(`empleadoLicenciaDorsoId`);

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_empleadoLicenciaDorsoId_fkey` FOREIGN KEY (`empleadoLicenciaDorsoId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
