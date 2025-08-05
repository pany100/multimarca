/*
  Warnings:

  - You are about to drop the column `cancelado` on the `Perdidas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Perdidas` DROP COLUMN `cancelado`;

-- CreateTable
CREATE TABLE `Recuperacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `monto` DECIMAL(10, 2) NOT NULL,
    `perdidaId` INTEGER NOT NULL,
    `detalle` VARCHAR(255) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Recuperacion` ADD CONSTRAINT `Recuperacion_perdidaId_fkey` FOREIGN KEY (`perdidaId`) REFERENCES `Perdidas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
