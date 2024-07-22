/*
  Warnings:

  - Made the column `date` on table `NotificacionWhatsapp` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `NotificacionWhatsapp` MODIFY `date` DATETIME(3) NOT NULL;
