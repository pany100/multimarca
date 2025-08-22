-- CreateTable
CREATE TABLE `Perdidas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `monto` DECIMAL(10, 2) NOT NULL,
    `descripcion` VARCHAR(255) NOT NULL,
    `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso',
    `dolarId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Perdidas` ADD CONSTRAINT `Perdidas_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
