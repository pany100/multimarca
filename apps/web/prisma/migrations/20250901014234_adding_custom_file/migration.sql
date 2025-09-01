-- CreateTable
CREATE TABLE `CustomFile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tempPath` VARCHAR(255) NOT NULL,
    `finalPath` VARCHAR(255) NULL,
    `status` ENUM('Pendiente', 'Listo', 'Error', 'Borrado') NOT NULL DEFAULT 'Pendiente',
    `promotedAt` DATETIME(3) NULL,
    `ordenReparacionId` INTEGER NULL,

    UNIQUE INDEX `CustomFile_ordenReparacionId_key`(`ordenReparacionId`),
    INDEX `CustomFile_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_ordenReparacionId_fkey` FOREIGN KEY (`ordenReparacionId`) REFERENCES `OrdenReparacion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
