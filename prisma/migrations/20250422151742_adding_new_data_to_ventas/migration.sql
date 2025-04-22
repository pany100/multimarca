-- AlterTable
ALTER TABLE `ReparacionDeTercero` ADD COLUMN `ventaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `RepuestoUsado` ADD COLUMN `ventaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TrabajoRealizado` ADD COLUMN `ventaId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Venta` ADD COLUMN `descripcionDescuento` VARCHAR(255) NULL,
    ADD COLUMN `descripcionIncremento` VARCHAR(255) NULL,
    ADD COLUMN `descuento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `incremento` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- CreateTable
CREATE TABLE `IngresoPorVenta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clienteId` INTEGER NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `ventaId` INTEGER NOT NULL,
    `reciboEnviado` BOOLEAN NOT NULL DEFAULT false,
    `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso',
    `dolarId` INTEGER NULL,
    `tipoOperacionId` INTEGER NULL,
    `chequeId` INTEGER NULL,

    INDEX `IngresoPorVenta_fecha_idx`(`fecha`),
    INDEX `IngresoPorVenta_clienteId_idx`(`clienteId`),
    INDEX `IngresoPorVenta_ventaId_idx`(`ventaId`),
    INDEX `IngresoPorVenta_dolarId_fkey`(`dolarId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `ReparacionDeTercero_ventaId_fkey` ON `ReparacionDeTercero`(`ventaId`);

-- CreateIndex
CREATE INDEX `RepuestoUsado_ventaId_fkey` ON `RepuestoUsado`(`ventaId`);

-- CreateIndex
CREATE INDEX `TrabajoRealizado_ventaId_fkey` ON `TrabajoRealizado`(`ventaId`);

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_tipoOperacionId_fkey` FOREIGN KEY (`tipoOperacionId`) REFERENCES `TipoDeOperacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_chequeId_fkey` FOREIGN KEY (`chequeId`) REFERENCES `Cheque`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
