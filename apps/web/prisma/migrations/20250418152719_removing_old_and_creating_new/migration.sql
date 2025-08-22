/*
  Warnings:

  - You are about to drop the column `tipoExtraccion` on the `Extraccion` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `tipoExtraccion` on the `IngresoManualDeDinero` table. All the data in the column will be lost.
  - You are about to drop the column `tipoOperacion` on the `IngresoPorReparacion` table. All the data in the column will be lost.
  - You are about to drop the column `tipoOperacion` on the `Venta` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Extraccion` DROP COLUMN `tipoExtraccion`,
    ADD COLUMN `tipoOperacionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Gasto` DROP COLUMN `tipo`,
    ADD COLUMN `tipoOperacionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `IngresoManualDeDinero` DROP COLUMN `tipoExtraccion`,
    ADD COLUMN `tipoOperacionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `IngresoPorReparacion` DROP COLUMN `tipoOperacion`,
    ADD COLUMN `tipoOperacionId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Venta` DROP COLUMN `tipoOperacion`,
    ADD COLUMN `tipoOperacionId` INTEGER NULL;

-- CreateTable
CREATE TABLE `TipoDeOperacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `TipoDeOperacion_label_key`(`label`),
    INDEX `TipoDeOperacion_label_idx`(`label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Extraccion` ADD CONSTRAINT `Extraccion_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
