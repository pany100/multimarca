/*
  Warnings:

  - You are about to alter the column `unidadesConsumidas` on the `RepuestoUsado` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(10,3)`.

*/
-- AlterTable
ALTER TABLE `RepuestoUsado` MODIFY `unidadesConsumidas` DECIMAL(10, 3) NOT NULL;

-- AlterTable
ALTER TABLE `Stock` ADD COLUMN `fraccionable` BOOLEAN NOT NULL DEFAULT false;
