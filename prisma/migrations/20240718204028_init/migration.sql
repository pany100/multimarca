-- CreateTable
CREATE TABLE `Usuario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fullName` VARCHAR(150) NOT NULL,
    `username` VARCHAR(150) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password` VARCHAR(300) NOT NULL,
    `avatar` VARCHAR(150) NULL,
    `reset_password_token` VARCHAR(255) NULL,
    `reset_password_token_expired` DATETIME(3) NULL,

    UNIQUE INDEX `Usuario_email_key`(`email`),
    INDEX `Usuario_fullName_idx`(`fullName`),
    INDEX `Usuario_username_idx`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
