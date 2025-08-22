-- CreateTable
CREATE TABLE `Feriado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,

    INDEX `Feriado_fecha_idx`(`fecha`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Turno` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `hora` DATETIME(3) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `problema` TEXT NOT NULL,
    `autoId` INTEGER NOT NULL,

    INDEX `Turno_fecha_idx`(`fecha`),
    INDEX `Turno_autoId_idx`(`autoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Turno` ADD CONSTRAINT `Turno_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
