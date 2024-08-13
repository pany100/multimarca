-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `OrdenReparacion` MODIFY `estado` ENUM('Presupuestado', 'EnProgreso', 'Aceptado', 'Terminado') NOT NULL DEFAULT 'Presupuestado';
