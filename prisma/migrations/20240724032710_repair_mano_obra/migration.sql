/*
  Warnings:

  - You are about to drop the column `manoDeObraId` on the `TrabajoRealizado` table. All the data in the column will be lost.
  - Added the required column `descripcion` to the `TrabajoRealizado` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `TrabajoRealizado` DROP FOREIGN KEY `TrabajoRealizado_manoDeObraId_fkey`;

-- AlterTable
ALTER TABLE `TrabajoRealizado` DROP COLUMN `manoDeObraId`,
    ADD COLUMN `descripcion` TEXT NOT NULL;
