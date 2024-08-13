-- DropForeignKey
ALTER TABLE `ReparacionDeTercero` DROP FOREIGN KEY `ReparacionDeTercero_plantillaPresupuestoId_fkey`;

-- DropForeignKey
ALTER TABLE `RepuestoUsado` DROP FOREIGN KEY `RepuestoUsado_plantillaPresupuestoId_fkey`;

-- DropForeignKey
ALTER TABLE `TrabajoRealizado` DROP FOREIGN KEY `TrabajoRealizado_plantillaPresupuestoId_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
