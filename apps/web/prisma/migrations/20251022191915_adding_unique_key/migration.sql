/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `Stock` will be added. If there are existing duplicate values, this will fail.
  - Made the column `label` on table `Stock` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Stock` MODIFY `label` VARCHAR(250) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Stock_label_key` ON `Stock`(`label`);
