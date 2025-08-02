-- AlterTable
ALTER TABLE `Venta` ADD COLUMN `estado` ENUM('Presupuestado', 'Preparado', 'Entregado', 'Cerrado') NOT NULL DEFAULT 'Presupuestado';
