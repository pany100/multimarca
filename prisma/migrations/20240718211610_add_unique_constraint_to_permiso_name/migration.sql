/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Permiso` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Permiso_name_key` ON `Permiso`(`name`);
