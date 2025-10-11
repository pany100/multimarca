/*
  Warnings:

  - You are about to alter the column `recurrence` on the `RecordatorioAgenda` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(12))`.

*/
-- AlterTable
ALTER TABLE `RecordatorioAgenda` MODIFY `recurrence` ENUM('No', 'Diario', 'Semanal', 'Mensual', 'Anual') NOT NULL DEFAULT 'No';
