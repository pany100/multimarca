-- AlterTable
ALTER TABLE `OrdenReparacion` MODIFY `estado` ENUM('Borrador', 'Presupuestado', 'EnProgreso', 'Aceptado', 'Terminado', 'SeRetira', 'Incobrable') NOT NULL DEFAULT 'Presupuestado';
