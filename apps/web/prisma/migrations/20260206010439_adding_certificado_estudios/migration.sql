-- CreateTable
CREATE TABLE `CertificadoEstudio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleadoId` INTEGER NOT NULL,
    `nombre` VARCHAR(255) NULL,
    `ruta` VARCHAR(1000) NULL,

    INDEX `CertificadoEstudio_empleadoId_idx`(`empleadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CertificadoEstudio` ADD CONSTRAINT `CertificadoEstudio_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
