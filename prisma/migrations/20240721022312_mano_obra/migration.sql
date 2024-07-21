-- CreateTable
CREATE TABLE `ManoDeObra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,
    `sellPrice` DECIMAL(10, 2) NOT NULL,

    INDEX `ManoDeObra_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
