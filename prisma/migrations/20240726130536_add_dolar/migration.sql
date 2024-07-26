-- CreateTable
CREATE TABLE `Dolar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `oficial` DECIMAL(10, 2) NOT NULL,
    `blue` DECIMAL(10, 2) NOT NULL,

    INDEX `Dolar_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
