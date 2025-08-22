-- CreateTable
CREATE TABLE `RecordatorioAgenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `hecho` BOOLEAN NOT NULL DEFAULT false,

    INDEX `RecordatorioAgenda_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
