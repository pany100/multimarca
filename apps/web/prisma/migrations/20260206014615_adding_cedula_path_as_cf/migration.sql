/*
  Warnings:

  - You are about to drop the column `cedulaPath` on the `Presupuesto` table. All the data in the column will be lost.
  - You are about to drop the column `cedulaPath` on the `Venta` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[presupuestoCedulaId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ventaCedulaId]` on the table `CustomFile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CustomFile` ADD COLUMN `presupuestoCedulaId` INTEGER NULL,
    ADD COLUMN `ventaCedulaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Presupuesto` DROP COLUMN `cedulaPath`;

-- AlterTable
ALTER TABLE `Venta` DROP COLUMN `cedulaPath`;

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_presupuestoCedulaId_key` ON `CustomFile`(`presupuestoCedulaId`);

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_ventaCedulaId_key` ON `CustomFile`(`ventaCedulaId`);

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_presupuestoCedulaId_fkey` FOREIGN KEY (`presupuestoCedulaId`) REFERENCES `Presupuesto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_ventaCedulaId_fkey` FOREIGN KEY (`ventaCedulaId`) REFERENCES `Venta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
