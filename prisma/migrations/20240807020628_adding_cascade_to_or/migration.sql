-- DropForeignKey
ALTER TABLE `ControlEnReparacion` DROP FOREIGN KEY `ControlEnReparacion_ordenReparacionId_fkey`;

-- DropForeignKey
ALTER TABLE `IngresoPorReparacion` DROP FOREIGN KEY `IngresoPorReparacion_ordenReparacionId_fkey`;

-- DropForeignKey
ALTER TABLE `NotificacionInterna` DROP FOREIGN KEY `NotificacionInterna_ordenReparacionId_fkey`;

-- DropForeignKey
ALTER TABLE `PagoAMecanico` DROP FOREIGN KEY `PagoAMecanico_ordenReparacionId_fkey`;

-- DropForeignKey
ALTER TABLE `RepuestoUsado` DROP FOREIGN KEY `RepuestoUsado_ordenReparacionId_fkey`;

-- DropForeignKey
ALTER TABLE `TrabajoRealizado` DROP FOREIGN KEY `TrabajoRealizado_ordenReparacionId_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ControlEnReparacion` ADD CONSTRAINT `ControlEnReparacion_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PagoAMecanico` ADD CONSTRAINT `PagoAMecanico_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificacionInterna` ADD CONSTRAINT `NotificacionInterna_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
