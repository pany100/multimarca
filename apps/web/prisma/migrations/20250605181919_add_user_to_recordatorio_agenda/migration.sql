-- AlterTable
ALTER TABLE `RecordatorioAgenda` ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `RecordatorioAgenda` ADD CONSTRAINT `RecordatorioAgenda_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
