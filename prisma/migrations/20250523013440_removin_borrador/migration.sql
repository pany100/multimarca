/*
  Warnings:

  - You are about to drop the column `borradorId` on the `ReparacionDeTercero` table. All the data in the column will be lost.
  - You are about to drop the column `borradorId` on the `RepuestoUsado` table. All the data in the column will be lost.
  - You are about to drop the column `borradorId` on the `TrabajoRealizado` table. All the data in the column will be lost.
  - You are about to drop the `Borrador` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Borrador` DROP FOREIGN KEY `Borrador_autoId_fkey`;

-- DropForeignKey
ALTER TABLE `ReparacionDeTercero` DROP FOREIGN KEY `ReparacionDeTercero_borradorId_fkey`;

-- DropForeignKey
ALTER TABLE `RepuestoUsado` DROP FOREIGN KEY `RepuestoUsado_borradorId_fkey`;

-- DropForeignKey
ALTER TABLE `TrabajoRealizado` DROP FOREIGN KEY `TrabajoRealizado_borradorId_fkey`;

-- AlterTable
ALTER TABLE `ReparacionDeTercero` DROP COLUMN `borradorId`;

-- AlterTable
ALTER TABLE `RepuestoUsado` DROP COLUMN `borradorId`;

-- AlterTable
ALTER TABLE `TrabajoRealizado` DROP COLUMN `borradorId`;

-- DropTable
DROP TABLE `Borrador`;
