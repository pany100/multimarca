/*
  Warnings:

  - You are about to drop the column `montoTotalCliente` on the `OrdenReparacion` table. All the data in the column will be lost.
  - Added the required column `manoDeObra` to the `OrdenReparacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `OrdenReparacion` RENAME COLUMN `montoTotalCliente` TO `manoDeObra`;
