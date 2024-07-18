-- AlterTable
ALTER TABLE `Usuario` ADD COLUMN `rolId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Permiso` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rol` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(150) NOT NULL,

    UNIQUE INDEX `Rol_name_key`(`name`),
    INDEX `Rol_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PermisoToRol` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PermisoToRol_AB_unique`(`A`, `B`),
    INDEX `_PermisoToRol_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuario` ADD CONSTRAINT `Usuario_rolId_fkey` FOREIGN KEY (`rolId`) REFERENCES `Rol`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisoToRol` ADD CONSTRAINT `_PermisoToRol_A_fkey` FOREIGN KEY (`A`) REFERENCES `Permiso`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PermisoToRol` ADD CONSTRAINT `_PermisoToRol_B_fkey` FOREIGN KEY (`B`) REFERENCES `Rol`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
