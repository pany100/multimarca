-- AlterTable
ALTER TABLE `Venta` MODIFY `estado` ENUM('Presupuestado', 'Preparado', 'Entregado', 'Cerrado') NOT NULL DEFAULT 'Entregado';
