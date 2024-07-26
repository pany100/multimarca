-- CreateTable
CREATE TABLE `IngresoPorReparacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clienteId` INTEGER NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `ordenReparacionId` INTEGER NOT NULL,

    INDEX `IngresoPorReparacion_fecha_idx`(`fecha`),
    INDEX `IngresoPorReparacion_clienteId_idx`(`clienteId`),
    INDEX `IngresoPorReparacion_ordenReparacionId_idx`(`ordenReparacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorReparacion` ADD CONSTRAINT `IngresoPorReparacion_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
