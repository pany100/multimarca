-- AlterTable
ALTER TABLE `RecordatorioAgenda` ADD COLUMN `fechaFinRecurrencia` DATETIME(3) NULL,
    ADD COLUMN `recurrence` VARCHAR(191) NOT NULL DEFAULT 'no';
