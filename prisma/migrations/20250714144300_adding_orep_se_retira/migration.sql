-- AlterTable
ALTER TABLE `OrdenReparacion` MODIFY `estado` ENUM('Presupuestado', 'EnProgreso', 'Aceptado', 'Terminado', 'SeRetira') NOT NULL DEFAULT 'Presupuestado';
