-- AlterTable
ALTER TABLE `Venta` ADD COLUMN `dolarId` INTEGER NULL,
    ADD COLUMN `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso';

-- CreateTable
CREATE TABLE `IngresoManualDeDinero` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monto` DECIMAL(10, 2) NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `descripcion` TEXT NULL,
    `moneda` ENUM('Dolar', 'Peso') NOT NULL DEFAULT 'Peso',
    `dolarId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IngresoManualDeDinero` ADD CONSTRAINT `IngresoManualDeDinero_dolarId_fkey` FOREIGN KEY (`dolarId`) REFERENCES `Dolar`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
