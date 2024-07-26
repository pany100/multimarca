/*
  Warnings:

  - You are about to drop the `PagoReparacion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PagoReparacion` DROP FOREIGN KEY `PagoReparacion_ordenReparacionId_fkey`;

-- DropTable
DROP TABLE `PagoReparacion`;

-- CreateTable
CREATE TABLE `PagoAMecanico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenReparacionId` INTEGER NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fechaPago` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PagoAMecanico_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `PagoAMecanico_fechaPago_idx`(`fechaPago`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PagoAMecanico` ADD CONSTRAINT `PagoAMecanico_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
