-- CreateTable
CREATE TABLE `PrestamoHerramientas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `herramienta` TEXT NOT NULL,
    `devuelto` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
