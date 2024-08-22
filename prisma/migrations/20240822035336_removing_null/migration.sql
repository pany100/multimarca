/*
  Warnings:

  - Made the column `clienteId` on table `ConversacionWhatsApp` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `ConversacionWhatsApp` DROP FOREIGN KEY `ConversacionWhatsApp_clienteId_fkey`;

-- AlterTable
ALTER TABLE `ConversacionWhatsApp` MODIFY `clienteId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `ConversacionWhatsApp` ADD CONSTRAINT `ConversacionWhatsApp_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
