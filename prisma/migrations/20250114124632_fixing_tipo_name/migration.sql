/*
  Warnings:

  - You are about to drop the column `tipoIngreso` on the `IngresoPorReparacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `IngresoPorReparacion` DROP COLUMN `tipoIngreso`,
    ADD COLUMN `tipoOperacion` ENUM('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE', 'DEBITO_AUTOMATICO_TARJETA_CREDITO') NOT NULL DEFAULT 'EFECTIVO';
