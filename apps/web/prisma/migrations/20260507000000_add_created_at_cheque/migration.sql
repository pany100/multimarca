-- AlterTable: add nullable column without default so existing rows stay NULL
ALTER TABLE `Cheque` ADD COLUMN `createdAt` DATETIME(3) NULL;

-- Set default CURRENT_TIMESTAMP for new rows (does not backfill existing rows)
ALTER TABLE `Cheque` MODIFY COLUMN `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);
