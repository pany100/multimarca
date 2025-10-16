/*
  Warnings:

  - Made the column `tipoOperacionId` on table `Gasto` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipoOperacionId` on table `IngresoManualDeDinero` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipoOperacionId` on table `IngresoPorReparacion` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tipoOperacionId` on table `IngresoPorVenta` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Gasto` DROP FOREIGN KEY `Gasto_tipoOperacionId_fkey`;

-- DropForeignKey
ALTER TABLE `IngresoManualDeDinero` DROP FOREIGN KEY `IngresoManualDeDinero_tipoOperacionId_fkey`;

-- DropForeignKey
ALTER TABLE `IngresoPorReparacion` DROP FOREIGN KEY `IngresoPorReparacion_tipoOperacionId_fkey`;

-- DropForeignKey
ALTER TABLE `IngresoPorVenta` DROP FOREIGN KEY `IngresoPorVenta_tipoOperacionId_fkey`;

-- AlterTable
ALTER TABLE `Gasto` MODIFY `tipoOperacionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `IngresoManualDeDinero` MODIFY `tipoOperacionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `IngresoPorReparacion` MODIFY `tipoOperacionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `IngresoPorVenta` MODIFY `tipoOperacionId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
