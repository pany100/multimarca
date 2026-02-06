-- CreateTable
CREATE TABLE `Sueldo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleadoId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `monto` DECIMAL(10, 2) NOT NULL,
    `descripcion` TEXT NULL,

    INDEX `Sueldo_empleadoId_idx`(`empleadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Sueldo` ADD CONSTRAINT `Sueldo_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
