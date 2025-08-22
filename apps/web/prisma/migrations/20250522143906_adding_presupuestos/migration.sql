-- AlterTable
ALTER TABLE `ReparacionDeTercero` ADD COLUMN `presupuestoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `RepuestoUsado` ADD COLUMN `presupuestoId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TrabajoRealizado` ADD COLUMN `presupuestoId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Presupuesto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `autoId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaEnvio` DATETIME(3) NULL,
    `fechaRespuesta` DATETIME(3) NULL,
    `observacionesCliente` TEXT NOT NULL,
    `detallesDeTrabajo` TEXT NULL,
    `descuento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descripcionDescuento` VARCHAR(255) NULL,
    `dolarId` INTEGER NULL,
    `incremento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `descripcionIncremento` VARCHAR(255) NULL,
    `estado` ENUM('EnPreparacion', 'Enviado', 'Aceptado', 'Rechazado') NOT NULL DEFAULT 'EnPreparacion',

    INDEX `Presupuesto_autoId_idx`(`autoId`),
    INDEX `Presupuesto_fecha_idx`(`fecha`),
    INDEX `Presupuesto_estado_idx`(`estado`),
    INDEX `Presupuesto_dolarId_fkey`(`dolarId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `TrabajoRealizado_presupuestoId_fkey` ON `TrabajoRealizado`(`presupuestoId`);

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Presupuesto` ADD CONSTRAINT `Presupuesto_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
