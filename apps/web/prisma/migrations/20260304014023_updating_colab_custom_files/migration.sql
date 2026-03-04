/*
  Warnings:

  - You are about to drop the column `ruta` on the `CertificadoEstudio` table. All the data in the column will be lost.
  - You are about to drop the column `certificadoMedicoPath` on the `Inasistencia` table. All the data in the column will be lost.
  - You are about to drop the column `certificadoPath` on the `LlegadaTarde` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[llegadaTardeCertificadoId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[inasistenciaCertificadoId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[certificadoEstudioRutaId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CertificadoEstudio` DROP COLUMN `ruta`;

-- AlterTable
ALTER TABLE `CustomFile` ADD COLUMN `certificadoEstudioRutaId` INTEGER NULL,
    ADD COLUMN `inasistenciaCertificadoId` INTEGER NULL,
    ADD COLUMN `llegadaTardeCertificadoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Inasistencia` DROP COLUMN `certificadoMedicoPath`;

-- AlterTable
ALTER TABLE `LlegadaTarde` DROP COLUMN `certificadoPath`;

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_llegadaTardeCertificadoId_key` ON `CustomFile`(`llegadaTardeCertificadoId`);

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_inasistenciaCertificadoId_key` ON `CustomFile`(`inasistenciaCertificadoId`);

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_certificadoEstudioRutaId_key` ON `CustomFile`(`certificadoEstudioRutaId`);

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_llegadaTardeCertificadoId_fkey` FOREIGN KEY (`llegadaTardeCertificadoId`) REFERENCES `LlegadaTarde`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_inasistenciaCertificadoId_fkey` FOREIGN KEY (`inasistenciaCertificadoId`) REFERENCES `Inasistencia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_certificadoEstudioRutaId_fkey` FOREIGN KEY (`certificadoEstudioRutaId`) REFERENCES `CertificadoEstudio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
