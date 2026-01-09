-- AlterTable
ALTER TABLE `CustomFile` MODIFY `status` ENUM('Pendiente', 'Listo', 'Error', 'ErrorAlSubit', 'ErrorAlBorrar', 'ListoParaBorrar', 'Borrado') NOT NULL DEFAULT 'Pendiente';
