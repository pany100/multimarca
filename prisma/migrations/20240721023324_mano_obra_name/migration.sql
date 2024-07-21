/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ManoDeObra` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ManoDeObra` MODIFY `name` VARCHAR(250) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ManoDeObra_name_key` ON `ManoDeObra`(`name`);
