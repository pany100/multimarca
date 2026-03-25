-- AlterTable
ALTER TABLE `MensajeWhatsApp` ADD COLUMN `mediaId` VARCHAR(100) NULL;

-- CreateIndex
CREATE INDEX `MensajeWhatsApp_mediaId_idx` ON `MensajeWhatsApp`(`mediaId`);
