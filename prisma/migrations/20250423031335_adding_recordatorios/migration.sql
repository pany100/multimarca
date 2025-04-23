/*
  Warnings:

  - You are about to drop the column `tipoOperacionOld` on the `Extraccion` table. All the data in the column will be lost.
  - You are about to drop the column `tipoOperacionOld` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `tipoOperacionOld` on the `IngresoManualDeDinero` table. All the data in the column will be lost.
  - You are about to drop the column `tipoOperacionOld` on the `IngresoPorReparacion` table. All the data in the column will be lost.
  - You are about to drop the column `chequeId` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `moneda` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `tipoOperacionId` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `tipoOperacionOld` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Venta` table. All the data in the column will be lost.
  - You are about to drop the `VentaItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Venta` DROP FOREIGN KEY `Venta_chequeId_fkey`;

-- DropForeignKey
ALTER TABLE `Venta` DROP FOREIGN KEY `Venta_tipoOperacionId_fkey`;

-- DropForeignKey
ALTER TABLE `VentaItem` DROP FOREIGN KEY `VentaItem_stockId_fkey`;

-- DropForeignKey
ALTER TABLE `VentaItem` DROP FOREIGN KEY `VentaItem_ventaId_fkey`;

-- AlterTable
ALTER TABLE `Extraccion` DROP COLUMN `tipoOperacionOld`;

-- AlterTable
ALTER TABLE `Gasto` DROP COLUMN `tipoOperacionOld`;

-- AlterTable
ALTER TABLE `IngresoManualDeDinero` DROP COLUMN `tipoOperacionOld`;

-- AlterTable
ALTER TABLE `IngresoPorReparacion` DROP COLUMN `tipoOperacionOld`;

-- AlterTable
ALTER TABLE `Venta` DROP COLUMN `chequeId`,
    DROP COLUMN `moneda`,
    DROP COLUMN `tipoOperacionId`,
    DROP COLUMN `tipoOperacionOld`,
    DROP COLUMN `total`;

-- DropTable
DROP TABLE `VentaItem`;
