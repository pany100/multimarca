-- CreateTable
CREATE TABLE `VentaMecanico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ventaId` INTEGER NOT NULL,
    `mecanicoId` INTEGER NOT NULL,
    `detalle` TEXT NULL,

    INDEX `VentaMecanico_mecanicoId_fkey`(`mecanicoId`),
    UNIQUE INDEX `VentaMecanico_ventaId_mecanicoId_key`(`ventaId`, `mecanicoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VentaMecanico` ADD CONSTRAINT `VentaMecanico_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Empleado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VentaMecanico` ADD CONSTRAINT `VentaMecanico_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
