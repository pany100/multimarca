-- AlterTable
ALTER TABLE `Empleado` ADD COLUMN `recategorizacionMonotributoPath` VARCHAR(1000) NULL;

-- CreateTable
CREATE TABLE `Inasistencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleadoId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `motivo` VARCHAR(255) NULL,
    `tipo` ENUM('Medica', 'Personal', 'SinAviso', 'Otro') NOT NULL DEFAULT 'Medica',
    `certificadoMedicoPath` VARCHAR(1000) NULL,

    INDEX `Inasistencia_empleadoId_idx`(`empleadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inasistencia` ADD CONSTRAINT `Inasistencia_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
