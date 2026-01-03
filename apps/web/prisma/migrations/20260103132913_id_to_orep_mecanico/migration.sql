/*
  Warnings:

  - The primary key for the `OrdenReparacionMecanico` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[ordenReparacionId,mecanicoId]` on the table `OrdenReparacionMecanico` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `OrdenReparacionMecanico` table without a default value. This is not possible if the table is not empty.

*/
-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS=0;

-- Step 1: Drop the old composite primary key
ALTER TABLE `OrdenReparacionMecanico` DROP PRIMARY KEY;

-- Step 2: Add the new id column with AUTO_INCREMENT (this will automatically populate existing rows)
ALTER TABLE `OrdenReparacionMecanico` ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY FIRST;

-- Step 3: Create unique index on the old composite key
CREATE UNIQUE INDEX `OrdenReparacionMecanico_ordenReparacionId_mecanicoId_key` ON `OrdenReparacionMecanico`(`ordenReparacionId`, `mecanicoId`);

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS=1;
