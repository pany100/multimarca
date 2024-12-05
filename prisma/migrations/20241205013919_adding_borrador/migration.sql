-- AlterTable
ALTER TABLE `ReparacionDeTercero` ADD COLUMN `borradorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `RepuestoUsado` ADD COLUMN `borradorId` INTEGER NULL;

-- AlterTable
ALTER TABLE `TrabajoRealizado` ADD COLUMN `borradorId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Borrador` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `autoId` INTEGER NOT NULL,
    `fechaCreacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `observacionesCliente` TEXT NOT NULL,
    `manoDeObra` DECIMAL(10, 2) NOT NULL,

    INDEX `Borrador_autoId_idx`(`autoId`),
    INDEX `Borrador_fechaCreacion_idx`(`fechaCreacion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RepuestoUsado` ADD CONSTRAINT `RepuestoUsado_borradorId_fkey` FOREIGN KEY (`borradorId`) REFERENCES `Borrador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReparacionDeTercero` ADD CONSTRAINT `ReparacionDeTercero_borradorId_fkey` FOREIGN KEY (`borradorId`) REFERENCES `Borrador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrabajoRealizado` ADD CONSTRAINT `TrabajoRealizado_borradorId_fkey` FOREIGN KEY (`borradorId`) REFERENCES `Borrador`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Borrador` ADD CONSTRAINT `Borrador_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
