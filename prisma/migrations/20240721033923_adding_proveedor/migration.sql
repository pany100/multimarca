-- CreateTable
CREATE TABLE `Stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(250) NOT NULL,
    `brand` VARCHAR(250) NOT NULL,
    `buyPrice` DECIMAL(10, 2) NOT NULL,
    `units` INTEGER NULL,
    `restockValue` INTEGER NULL,
    `label` VARCHAR(250) NULL,
    `markup` DOUBLE NULL,
    `proveedorId` INTEGER NOT NULL,

    INDEX `Stock_name_idx`(`name`),
    INDEX `Stock_brand_idx`(`brand`),
    INDEX `Stock_proveedorId_idx`(`proveedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
