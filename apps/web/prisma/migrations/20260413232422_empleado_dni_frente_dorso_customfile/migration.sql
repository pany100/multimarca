/*
  Warnings:

  - A unique constraint covering the columns `[empleadoDniFrenteId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empleadoDniDorsoId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CustomFile` ADD COLUMN `empleadoDniFrenteId` INTEGER NULL,
    ADD COLUMN `empleadoDniDorsoId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_empleadoDniFrenteId_key` ON `CustomFile`(`empleadoDniFrenteId`);

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_empleadoDniDorsoId_key` ON `CustomFile`(`empleadoDniDorsoId`);

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_empleadoDniFrenteId_fkey` FOREIGN KEY (`empleadoDniFrenteId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_empleadoDniDorsoId_fkey` FOREIGN KEY (`empleadoDniDorsoId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
