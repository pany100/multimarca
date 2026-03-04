/*
  Warnings:

  - You are about to drop the column `curriculumPath` on the `Empleado` table. All the data in the column will be lost.
  - You are about to drop the column `inscripcionMonotributoPath` on the `Empleado` table. All the data in the column will be lost.
  - You are about to drop the column `licenciaConducirPath` on the `Empleado` table. All the data in the column will be lost.
  - You are about to drop the column `recategorizacionMonotributoPath` on the `Empleado` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[empleadoLicenciaConducirId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empleadoInscripcionMonotributoId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empleadoRecategorizacionMonotributoId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[empleadoCurriculumId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CustomFile` ADD COLUMN `empleadoCurriculumId` INTEGER NULL,
    ADD COLUMN `empleadoInscripcionMonotributoId` INTEGER NULL,
    ADD COLUMN `empleadoLicenciaConducirId` INTEGER NULL,
    ADD COLUMN `empleadoRecategorizacionMonotributoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Empleado` DROP COLUMN `curriculumPath`,
    DROP COLUMN `inscripcionMonotributoPath`,
    DROP COLUMN `licenciaConducirPath`,
    DROP COLUMN `recategorizacionMonotributoPath`;

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_empleadoLicenciaConducirId_key` ON `CustomFile`(`empleadoLicenciaConducirId`);

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_empleadoInscripcionMonotributoId_key` ON `CustomFile`(`empleadoInscripcionMonotributoId`);

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_empleadoRecategorizacionMonotributoId_key` ON `CustomFile`(`empleadoRecategorizacionMonotributoId`);

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_empleadoCurriculumId_key` ON `CustomFile`(`empleadoCurriculumId`);

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_empleadoLicenciaConducirId_fkey` FOREIGN KEY (`empleadoLicenciaConducirId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_empleadoInscripcionMonotributoId_fkey` FOREIGN KEY (`empleadoInscripcionMonotributoId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_empleadoRecategorizacionMonotributoId_fkey` FOREIGN KEY (`empleadoRecategorizacionMonotributoId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_empleadoCurriculumId_fkey` FOREIGN KEY (`empleadoCurriculumId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
