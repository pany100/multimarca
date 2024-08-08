-- DropForeignKey
ALTER TABLE `ControlEnReparacion` DROP FOREIGN KEY `ControlEnReparacion_controlMecanicoId_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `ControlEnReparacion` ADD CONSTRAINT `ControlEnReparacion_controlMecanicoId_fkey` FOREIGN KEY (`controlMecanicoId`) REFERENCES `ControlMecanico`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
