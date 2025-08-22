/*
  Warnings:

  - You are about to drop the column `operacionCheque` on the `Cheque` table. All the data in the column will be lost.
  - You are about to drop the column `operacionId` on the `Cheque` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Cheque` DROP COLUMN `operacionCheque`,
    DROP COLUMN `operacionId`;
