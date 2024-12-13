-- AlterTable
ALTER TABLE `IngresoManualDeDinero` ADD COLUMN `tipoExtraccion` ENUM('EFECTIVO', 'TRANSFERENCIA') NOT NULL DEFAULT 'EFECTIVO',
    ADD COLUMN `usuarioId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `IngresoManualDeDinero_usuarioId_idx` ON `IngresoManualDeDinero`(`usuarioId`);

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
