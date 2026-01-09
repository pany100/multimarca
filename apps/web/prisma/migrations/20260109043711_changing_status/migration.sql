-- AlterTable
ALTER TABLE `CustomFile` MODIFY `status` ENUM('Pendiente', 'Listo', 'Error', 'ListoParaBorrar', 'Borrado') NOT NULL DEFAULT 'Pendiente';
