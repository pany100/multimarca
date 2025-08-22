-- AlterTable
ALTER TABLE `Presupuesto` MODIFY `estado` ENUM('EnPreparacion', 'Terminado', 'Enviado', 'Aceptado', 'Rechazado', 'Descartado') NOT NULL DEFAULT 'EnPreparacion';
