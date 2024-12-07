-- CreateTable
CREATE TABLE `_CategoriaGastoToRol` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_CategoriaGastoToRol_AB_unique`(`A`, `B`),
    INDEX `_CategoriaGastoToRol_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_CategoriaGastoToRol` ADD CONSTRAINT `_CategoriaGastoToRol_A_fkey` FOREIGN KEY (`A`) REFERENCES `CategoriaGasto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_CategoriaGastoToRol` ADD CONSTRAINT `_CategoriaGastoToRol_B_fkey` FOREIGN KEY (`B`) REFERENCES `Rol`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
