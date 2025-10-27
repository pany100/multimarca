-- AlterTable
ALTER TABLE `OrdenReparacion` MODIFY `estado` ENUM('Presupuestado', 'EnProgreso', 'Aceptado', 'Terminado', 'SeRetira', 'Incobrable') NOT NULL DEFAULT 'Presupuestado';
