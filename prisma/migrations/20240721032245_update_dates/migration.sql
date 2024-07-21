/*
  Warnings:

  - You are about to alter the column `start_date` on the `Mecanico` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `DateTime(3)`.
  - You are about to alter the column `birthday` on the `Mecanico` table. The data in that column could be lost. The data in that column will be cast from `VarChar(150)` to `DateTime(3)`.

*/
-- AlterTable
ALTER TABLE `Mecanico` MODIFY `start_date` DATETIME(3) NULL,
    MODIFY `birthday` DATETIME(3) NULL;
