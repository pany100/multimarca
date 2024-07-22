-- CreateTable
CREATE TABLE `Gasto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `precio` DECIMAL(10, 2) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `categoriaId` INTEGER NOT NULL,
    `mecanicoId` INTEGER NULL,
    `ordenDeCompraId` INTEGER NULL,

    INDEX `Gasto_categoriaId_idx`(`categoriaId`),
    INDEX `Gasto_mecanicoId_idx`(`mecanicoId`),
    INDEX `Gasto_ordenDeCompraId_idx`(`ordenDeCompraId`),
    INDEX `Gasto_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaGasto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `CategoriaGasto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Mecanico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gasto` ADD CONSTRAINT `Gasto_ordenDeCompraId_fkey` FOREIGN KEY (`ordenDeCompraId`) REFERENCES `OrdenDeCompra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
