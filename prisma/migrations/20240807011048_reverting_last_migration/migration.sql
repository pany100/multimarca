/*
  Warnings:

  - You are about to drop the column `labelId` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the `Rotulo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Stock` DROP FOREIGN KEY `Stock_labelId_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Stock` DROP COLUMN `labelId`,
    ADD COLUMN `label` VARCHAR(250) NULL;

-- DropTable
DROP TABLE `Rotulo`;
