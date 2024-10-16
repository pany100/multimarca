/*
  Warnings:

  - A unique constraint covering the columns `[numeroProveedor]` on the table `Proveedor` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `Proveedor_numeroProveedor_key` ON `Proveedor`(`numeroProveedor`);
