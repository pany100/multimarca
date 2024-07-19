-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phone` VARCHAR(20) NULL,
    `fullName` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NULL,
    `birthday` DATETIME(3) NULL,
    `address` VARCHAR(200) NULL,
    `city` VARCHAR(100) NULL,
    `state` VARCHAR(100) NULL,
    `postal_code` VARCHAR(10) NULL,
    `tax_status` VARCHAR(50) NULL,
    `dni` VARCHAR(20) NULL,
    `can_receive_notifications` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Cliente_dni_key`(`dni`),
    INDEX `Cliente_fullName_idx`(`fullName`),
    INDEX `Cliente_email_idx`(`email`),
    INDEX `Cliente_dni_idx`(`dni`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Auto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patent` VARCHAR(150) NOT NULL,
    `model` VARCHAR(150) NULL,
    `brand` VARCHAR(150) NULL,
    `color` VARCHAR(50) NULL,
    `year` INTEGER NULL,
    `kms` INTEGER NULL,
    `valves` INTEGER NULL,
    `ownerId` INTEGER NOT NULL,
    `chassis_number` VARCHAR(150) NULL,
    `engine_number` VARCHAR(150) NULL,
    `observations` VARCHAR(255) NULL,
    `transmission_type` VARCHAR(20) NULL,
    `cedulaVerdePath` VARCHAR(255) NULL,

    INDEX `Auto_patent_idx`(`patent`),
    INDEX `Auto_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Auto` ADD CONSTRAINT `Auto_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
