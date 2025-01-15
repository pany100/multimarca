/*
  Warnings:

  - Added the required column `picturePath` to the `Cheque` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Cheque` ADD COLUMN `picturePath` VARCHAR(255) NOT NULL;
