-- AlterTable: add autoCedulaVerdeId to CustomFile so new cédulas de auto se gestionan por el flujo tmp/ → cron.
-- El campo legacy `Auto.cedulaVerdePath` se mantiene sin backfill: se usa como fallback para registros históricos.
ALTER TABLE `CustomFile` ADD COLUMN `autoCedulaVerdeId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_autoCedulaVerdeId_key` ON `CustomFile`(`autoCedulaVerdeId`);

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_autoCedulaVerdeId_fkey` FOREIGN KEY (`autoCedulaVerdeId`) REFERENCES `Auto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
