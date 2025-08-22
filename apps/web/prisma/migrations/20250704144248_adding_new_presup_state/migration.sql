-- AlterTable
ALTER TABLE `Presupuesto` MODIFY `estado` ENUM('EnPreparacion', 'Enviado', 'Aceptado', 'Rechazado', 'Descartado') NOT NULL DEFAULT 'EnPreparacion';
