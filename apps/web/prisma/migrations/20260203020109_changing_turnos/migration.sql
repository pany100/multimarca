-- DropForeignKey
ALTER TABLE `Turno` DROP FOREIGN KEY `Turno_autoId_fkey`;

-- AlterTable
ALTER TABLE `Turno` ADD COLUMN `informacionAuto` TEXT NULL,
    ADD COLUMN `informacionCliente` TEXT NULL,
    MODIFY `autoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Turno` ADD CONSTRAINT `Turno_autoId_fkey` FOREIGN KEY (`autoId`) REFERENCES `Auto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
