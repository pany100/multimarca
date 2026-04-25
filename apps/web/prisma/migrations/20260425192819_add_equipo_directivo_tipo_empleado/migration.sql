-- AlterTable
ALTER TABLE `Empleado` MODIFY `tipo` ENUM('Mecanico', 'Administrativo', 'EquipoDirectivo') NOT NULL DEFAULT 'Mecanico';
