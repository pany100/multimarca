/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `CategoriaGasto` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CategoriaGasto_nombre_key` ON `CategoriaGasto`(`nombre`);

-- CreateIndex
CREATE INDEX `CategoriaGasto_nombre_idx` ON `CategoriaGasto`(`nombre`);
