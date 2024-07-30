/*
  Warnings:

  - You are about to alter the column `estado` on the `OrdenReparacion` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(1))`.

*/
-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `OrdenReparacion` MODIFY `estado` ENUM('Presupuestado', 'EnProgreso', 'Aceptado', 'Terminado') NOT NULL;

-- CreateTable
CREATE TABLE `NotificacionInterna` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `titulo` VARCHAR(255) NOT NULL,
    `texto` TEXT NOT NULL,
    `leida` BOOLEAN NOT NULL DEFAULT false,
    `tipo` ENUM('REPOSICION_STOCK', 'REPARACION_TERMINADA') NOT NULL,
    `stockId` INTEGER NULL,
    `ordenReparacionId` INTEGER NULL,

    INDEX `NotificacionInterna_fecha_idx`(`fecha`),
    INDEX `NotificacionInterna_leida_idx`(`leida`),
    INDEX `NotificacionInterna_tipo_idx`(`tipo`),
    INDEX `NotificacionInterna_stockId_idx`(`stockId`),
    INDEX `NotificacionInterna_ordenReparacionId_idx`(`ordenReparacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `NotificacionInterna` ADD CONSTRAINT `NotificacionInterna_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionInterna` ADD CONSTRAINT `NotificacionInterna_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
