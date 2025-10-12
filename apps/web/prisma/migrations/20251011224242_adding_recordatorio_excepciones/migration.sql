-- CreateTable
CREATE TABLE `RecordatorioRecurrenteExcepciones` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `recordatorioId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RecordatorioRecurrenteExcepciones` ADD CONSTRAINT `RecordatorioRecurrenteExcepciones_recordatorioId_fkey` FOREIGN KEY (`recordatorioId`) REFERENCES `RecordatorioAgenda`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
