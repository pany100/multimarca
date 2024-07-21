/*
  Warnings:

  - You are about to drop the `ControlesMecanicos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `ControlesMecanicos`;

-- CreateTable
CREATE TABLE `ControlMecanico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `type` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `ControlMecanico_name_key`(`name`),
    INDEX `ControlMecanico_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
