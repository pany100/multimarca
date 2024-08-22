-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- CreateTable
CREATE TABLE `ConversacionWhatsApp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clienteId` INTEGER NULL,
    `iniciada` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ultimoMensaje` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('Activa', 'Cerrada') NOT NULL DEFAULT 'Activa',

    INDEX `ConversacionWhatsApp_clienteId_idx`(`clienteId`),
    INDEX `ConversacionWhatsApp_iniciada_idx`(`iniciada`),
    INDEX `ConversacionWhatsApp_ultimoMensaje_idx`(`ultimoMensaje`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MensajeWhatsApp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `from` VARCHAR(50) NOT NULL,
    `body` TEXT NOT NULL,
    `tipo` VARCHAR(20) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `conversacionId` INTEGER NOT NULL,

    INDEX `MensajeWhatsApp_from_idx`(`from`),
    INDEX `MensajeWhatsApp_timestamp_idx`(`timestamp`),
    INDEX `MensajeWhatsApp_conversacionId_idx`(`conversacionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ConversacionWhatsApp` ADD CONSTRAINT `ConversacionWhatsApp_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MensajeWhatsApp` ADD CONSTRAINT `MensajeWhatsApp_conversacionId_fkey` FOREIGN KEY (`conversacionId`) REFERENCES `ConversacionWhatsApp`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
