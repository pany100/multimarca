/*
  Warnings:

  - You are about to drop the `Mecanico` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Gasto` DROP FOREIGN KEY `Gasto_mecanicoId_fkey`;

-- DropForeignKey
ALTER TABLE `OrdenReparacionMecanico` DROP FOREIGN KEY `OrdenReparacionMecanico_mecanicoId_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- DropTable
DROP TABLE `Mecanico`;

-- CreateTable
CREATE TABLE `Empleado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `tipo` ENUM('Mecanico', 'Administrativo') NOT NULL DEFAULT 'Mecanico',
    `start_date` DATETIME(3) NULL,
    `dni` VARCHAR(191) NULL,
    `address` VARCHAR(150) NULL,
    `city` VARCHAR(150) NULL,
    `state` VARCHAR(150) NULL,
    `postal_code` VARCHAR(10) NULL,
    `email` VARCHAR(150) NULL,
    `phone` VARCHAR(150) NULL,
    `birthday` DATETIME(3) NULL,
    `dniImagePath` VARCHAR(1000) NULL,

    UNIQUE INDEX `Empleado_name_key`(`name`),
    INDEX `Empleado_name_idx`(`name`),
    INDEX `Empleado_dni_idx`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrdenReparacionMecanico` ADD CONSTRAINT `OrdenReparacionMecanico_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
