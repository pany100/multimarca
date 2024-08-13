-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `ReparacionDeTercero` ADD COLUMN `plantillaPresupuestoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `RepuestoUsado` ADD COLUMN `plantillaPresupuestoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TrabajoRealizado` ADD COLUMN `plantillaPresupuestoId` INTEGER NULL;

-- CreateTable
CREATE TABLE `PlantillaPresupuesto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `manoDeObra` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_plantillaPresupuestoId_fkey` FOREIGN KEY (`plantillaPresupuestoId`) REFERENCES `PlantillaPresupuesto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
