-- AlterTable
ALTER TABLE `ConversacionWhatsApp` ADD COLUMN `ultimoMensajeEntrante` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `MensajeWhatsApp` ADD COLUMN `requiresHuman` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `sentByAi` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `status` VARCHAR(20) NULL,
    ADD COLUMN `templateName` VARCHAR(100) NULL,
    ADD COLUMN `waMessageId` VARCHAR(100) NULL;

-- CreateIndex
CREATE INDEX `MensajeWhatsApp_waMessageId_idx` ON `MensajeWhatsApp`(`waMessageId`);
