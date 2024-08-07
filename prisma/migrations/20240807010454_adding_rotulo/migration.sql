/*
  Warnings:

  - You are about to drop the column `label` on the `Stock` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Stock` DROP COLUMN `label`,
    ADD COLUMN `labelId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Rotulo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(150) NOT NULL,

    INDEX `Rotulo_nombre_idx`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_labelId_fkey` FOREIGN KEY (`labelId`) REFERENCES `Rotulo`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
