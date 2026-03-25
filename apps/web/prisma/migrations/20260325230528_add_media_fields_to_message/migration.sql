-- AlterTable
ALTER TABLE `MensajeWhatsApp` ADD COLUMN `mediaCaption` TEXT NULL,
    ADD COLUMN `mediaMimeType` VARCHAR(100) NULL,
    ADD COLUMN `replyToWaId` VARCHAR(100) NULL;
