/*
  Warnings:

  - A unique constraint covering the columns `[empleadoCredencialPagoId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CustomFile` ADD COLUMN `empleadoCredencialPagoId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_empleadoCredencialPagoId_key` ON `CustomFile`(`empleadoCredencialPagoId`);

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_empleadoCredencialPagoId_fkey` FOREIGN KEY (`empleadoCredencialPagoId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
