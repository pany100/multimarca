-- AlterTable
ALTER TABLE `NotificacionInterna` ADD COLUMN `userId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `NotificacionInterna_userId_idx` ON `NotificacionInterna`(`userId`);

-- AddForeignKey
ALTER TABLE `NotificacionInterna` ADD CONSTRAINT `NotificacionInterna_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
