/*
  Warnings:

  - You are about to drop the column `manoDeObra` on the `Borrador` table. All the data in the column will be lost.
  - You are about to drop the column `manoDeObra` on the `OrdenReparacion` table. All the data in the column will be lost.
  - You are about to drop the column `manoDeObra` on the `PlantillaPresupuesto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Borrador` DROP COLUMN `manoDeObra`;

-- AlterTable
ALTER TABLE `OrdenReparacion` DROP COLUMN `manoDeObra`;

-- AlterTable
ALTER TABLE `PlantillaPresupuesto` DROP COLUMN `manoDeObra`;
