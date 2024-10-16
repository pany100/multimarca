/*
  Warnings:

  - Added the required column `numeroProveedor` to the `Proveedor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Proveedor` ADD COLUMN `numeroProveedor` INTEGER NOT NULL;
