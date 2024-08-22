/*
  Warnings:

  - Added the required column `to` to the `MensajeWhatsApp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `MensajeWhatsApp` ADD COLUMN `read` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `to` VARCHAR(50) NOT NULL;
