/*
  Warnings:

  - You are about to drop the column `avatar` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Usuario` DROP COLUMN `avatar`;
