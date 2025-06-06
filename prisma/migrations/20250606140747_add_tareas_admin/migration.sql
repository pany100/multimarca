-- CreateTable
CREATE TABLE `TareaAdministrativa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `descripcion` TEXT NOT NULL,
    `presupuestoId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,

    INDEX `TareaAdministrativa_presupuestoId_idx`(`presupuestoId`),
    INDEX `TareaAdministrativa_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TareaAdministrativa` ADD CONSTRAINT `TareaAdministrativa_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TareaAdministrativa` ADD CONSTRAINT `TareaAdministrativa_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
