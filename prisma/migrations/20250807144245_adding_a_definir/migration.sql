-- AlterTable
ALTER TABLE `Presupuesto` MODIFY `estado` ENUM('EnPreparacion', 'Terminado', 'Enviado', 'ADefinir', 'Aceptado', 'Rechazado', 'Descartado') NOT NULL DEFAULT 'EnPreparacion';
