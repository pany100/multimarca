-- AlterTable
ALTER TABLE `OrdenReparacion` ADD COLUMN `modoAjustes` ENUM('acumulativo', 'sobreTotalBase') NOT NULL DEFAULT 'sobreTotalBase';

-- AlterTable
ALTER TABLE `Presupuesto` ADD COLUMN `modoAjustes` ENUM('acumulativo', 'sobreTotalBase') NOT NULL DEFAULT 'sobreTotalBase';

-- AlterTable
ALTER TABLE `Venta` ADD COLUMN `modoAjustes` ENUM('acumulativo', 'sobreTotalBase') NOT NULL DEFAULT 'sobreTotalBase';

-- CreateTable
CREATE TABLE `AjustePrecio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` VARCHAR(255) NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `tipo` ENUM('porcentual', 'fijo') NOT NULL,
    `esDescuento` BOOLEAN NOT NULL DEFAULT false,
    `esInterno` BOOLEAN NOT NULL DEFAULT false,
    `orden` INTEGER NOT NULL DEFAULT 0,
    `ordenReparacionId` INTEGER NULL,
    `ventaId` INTEGER NULL,
    `presupuestoId` INTEGER NULL,

    INDEX `AjustePrecio_ordenReparacionId_idx`(`ordenReparacionId`),
    INDEX `AjustePrecio_ventaId_idx`(`ventaId`),
    INDEX `AjustePrecio_presupuestoId_idx`(`presupuestoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AjustePrecio` ADD CONSTRAINT `AjustePrecio_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AjustePrecio` ADD CONSTRAINT `AjustePrecio_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AjustePrecio` ADD CONSTRAINT `AjustePrecio_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
