/*
  Warnings:

  - You are about to alter the column `units` on the `Stock` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,3)`.

*/
-- AlterTable
ALTER TABLE `Stock` MODIFY `units` DECIMAL(10, 3) NULL;
