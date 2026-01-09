/*
  Warnings:

  - The values [ErrorAlSubit] on the enum `CustomFile_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `CustomFile` MODIFY `status` ENUM('Pendiente', 'Listo', 'Error', 'ErrorAlSubir', 'ErrorAlBorrar', 'ListoParaBorrar', 'Borrado') NOT NULL DEFAULT 'Pendiente';
