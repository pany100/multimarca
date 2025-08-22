-- AlterTable
ALTER TABLE `Cheque` ADD COLUMN `fechaRechazo` DATETIME(3) NULL,
    ADD COLUMN `gastosAdministrativos` DECIMAL(10, 2) NULL,
    ADD COLUMN `motivoRechazo` VARCHAR(255) NULL,
    ADD COLUMN `observaciones` TEXT NULL,
    ADD COLUMN `rechazado` BOOLEAN NOT NULL DEFAULT false;
