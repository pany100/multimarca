/*
  Warnings:

  - You are about to drop the column `ordenDeCompraId` on the `Gasto` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Gasto` DROP FOREIGN KEY `Gasto_ordenDeCompraId_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Gasto` DROP COLUMN `ordenDeCompraId`,
    ADD COLUMN `detalle` TEXT NULL,
    ADD COLUMN `proveedorId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Gasto_proveedorId_idx` ON `Gasto`(`proveedorId`);

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
