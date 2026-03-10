-- CreateTable
CREATE TABLE `ConfiguracionGeneral` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(255) NOT NULL,
    `valor` TEXT NOT NULL,

    UNIQUE INDEX `ConfiguracionGeneral_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
