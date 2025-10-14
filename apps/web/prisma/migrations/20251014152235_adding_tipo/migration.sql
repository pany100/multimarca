-- AlterTable
ALTER TABLE `AusenciaProgramada` ADD COLUMN `tipo` ENUM('Vacaciones', 'Licencia') NOT NULL DEFAULT 'Vacaciones';
