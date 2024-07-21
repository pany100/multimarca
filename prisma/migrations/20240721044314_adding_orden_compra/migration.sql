-- CreateTable
CREATE TABLE `OrdenDeCompra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `precioTotal` DECIMAL(10, 2) NOT NULL,
    `proveedorId` INTEGER NOT NULL,

    INDEX `OrdenDeCompra_proveedorId_idx`(`proveedorId`),
    INDEX `OrdenDeCompra_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrdenDeCompraItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cantidad` INTEGER NOT NULL,
    `stockId` INTEGER NOT NULL,
    `ordenDeCompraId` INTEGER NOT NULL,

    INDEX `OrdenDeCompraItem_stockId_idx`(`stockId`),
    INDEX `OrdenDeCompraItem_ordenDeCompraId_idx`(`ordenDeCompraId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrdenDeCompra` ADD CONSTRAINT `OrdenDeCompra_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenDeCompraItem` ADD CONSTRAINT `OrdenDeCompraItem_stockId_fkey` FOREIGN KEY (`stockId`) REFERENCES `Stock`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenDeCompraItem` ADD CONSTRAINT `OrdenDeCompraItem_ordenDeCompraId_fkey` FOREIGN KEY (`ordenDeCompraId`) REFERENCES `OrdenDeCompra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
