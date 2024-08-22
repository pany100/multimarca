-- DropForeignKey
ALTER TABLE `ConversacionWhatsApp` DROP FOREIGN KEY `ConversacionWhatsApp_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `MensajeWhatsApp` DROP FOREIGN KEY `MensajeWhatsApp_conversacionId_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `ConversacionWhatsApp` ADD CONSTRAINT `ConversacionWhatsApp_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MensajeWhatsApp` ADD CONSTRAINT `MensajeWhatsApp_conversacionId_fkey` FOREIGN KEY (`conversacionId`) REFERENCES `ConversacionWhatsApp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
