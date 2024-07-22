-- CreateTable
CREATE TABLE `NotificacionWhatsapp` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(250) NOT NULL,
    `date` VARCHAR(10) NULL,
    `whatsappKey` VARCHAR(250) NOT NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `informacion` TEXT NOT NULL,

    INDEX `NotificacionWhatsapp_date_idx`(`date`),
    INDEX `NotificacionWhatsapp_processed_idx`(`processed`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
