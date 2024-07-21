-- CreateTable
CREATE TABLE `Proveedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `address` VARCHAR(150) NULL,
    `email` VARCHAR(150) NULL,
    `phone` VARCHAR(150) NULL,
    `mobile` VARCHAR(150) NULL,
    `iva` VARCHAR(150) NULL,
    `cuit` VARCHAR(150) NULL,

    UNIQUE INDEX `Proveedor_name_key`(`name`),
    INDEX `Proveedor_name_idx`(`name`),
    INDEX `Proveedor_cuit_idx`(`cuit`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mecanico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `start_date` VARCHAR(50) NULL,
    `dni` BIGINT NULL,
    `address` VARCHAR(150) NULL,
    `city` VARCHAR(150) NULL,
    `state` VARCHAR(150) NULL,
    `postal_code` VARCHAR(10) NULL,
    `email` VARCHAR(150) NULL,
    `phone` VARCHAR(150) NULL,
    `birthday` VARCHAR(150) NULL,

    UNIQUE INDEX `Mecanico_name_key`(`name`),
    INDEX `Mecanico_name_idx`(`name`),
    INDEX `Mecanico_dni_idx`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
