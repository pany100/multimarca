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

RENAME TABLE `Mecanico` TO `Empleado`;

ALTER TABLE `Empleado`
ADD COLUMN `tipo` ENUM('Mecanico', 'Administrativo') NOT NULL DEFAULT 'Mecanico',
ADD COLUMN `dniImagePath` VARCHAR(1000) NULL;

-- Crear índices
CREATE UNIQUE INDEX `Empleado_name_key` ON `Empleado`(`name`);
CREATE INDEX `Empleado_name_idx` ON `Empleado`(`name`);
CREATE INDEX `Empleado_dni_idx` ON `Empleado`(`dni`);

-- AddForeignKey
ALTER TABLE `OrdenReparacionMecanico` ADD CONSTRAINT `OrdenReparacionMecanico_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Empleado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
