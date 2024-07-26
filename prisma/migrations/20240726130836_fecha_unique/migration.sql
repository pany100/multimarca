/*
  Warnings:

  - A unique constraint covering the columns `[fecha]` on the table `Dolar` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `Dolar_fecha_key` ON `Dolar`(`fecha`);
