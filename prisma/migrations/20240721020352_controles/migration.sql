-- CreateTable
CREATE TABLE `ControlesMecanicos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `type` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `ControlesMecanicos_name_key`(`name`),
    INDEX `ControlesMecanicos_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
