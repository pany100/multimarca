/*
  Warnings:

  - You are about to drop the `AusenciasAcordadas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `AusenciasAcordadas` DROP FOREIGN KEY `AusenciasAcordadas_empleadoId_fkey`;

-- DropTable
DROP TABLE `AusenciasAcordadas`;

-- CreateTable
CREATE TABLE `AusenciaProgramada` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empleadoId` INTEGER NOT NULL,
    `fechaDesde` DATETIME(3) NOT NULL,
    `fechaHasta` DATETIME(3) NOT NULL,
    `estado` ENUM('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada') NOT NULL DEFAULT 'Pendiente',
    `observaciones` TEXT NULL,
    `esGoceSueldo` BOOLEAN NOT NULL DEFAULT true,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fechaAprobacion` DATETIME(3) NULL,

    INDEX `AusenciaProgramada_empleadoId_idx`(`empleadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AusenciaProgramada` ADD CONSTRAINT `AusenciaProgramada_empleadoId_fkey` FOREIGN KEY (`empleadoId`) REFERENCES `Empleado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
