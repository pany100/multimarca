/*
  Warnings:

  - You are about to drop the column `monto` on the `Cheque` table. All the data in the column will be lost.
  - Added the required column `importe` to the `Cheque` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Cheque` DROP COLUMN `monto`,
    ADD COLUMN `importe` DECIMAL(10, 2) NOT NULL;
