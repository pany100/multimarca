-- CreateTable
CREATE TABLE `Vacacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleadoId` INTEGER NOT NULL,
    `fechaDesde` DATETIME(3) NOT NULL,
    `fechaHasta` DATETIME(3) NOT NULL,
    `estado` ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
    `observaciones` TEXT NULL,
    `esGoceSueldo` BOOLEAN NOT NULL DEFAULT true,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaAprobacion` DATETIME(3) NULL,

    INDEX `Vacacion_empleadoId_idx`(`empleadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vacacion` ADD CONSTRAINT `Vacacion_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
