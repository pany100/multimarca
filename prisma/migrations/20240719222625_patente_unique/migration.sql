/*
  Warnings:

  - A unique constraint covering the columns `[patent]` on the table `Auto` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Auto_patent_key` ON `Auto`(`patent`);
