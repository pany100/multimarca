-- DropForeignKey
ALTER TABLE `IngresoPorVenta` DROP FOREIGN KEY `IngresoPorVenta_clienteId_fkey`;

-- AlterTable
ALTER TABLE `IngresoPorVenta` ADD COLUMN `informacionCliente` TEXT NULL,
    MODIFY `clienteId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Venta` ADD COLUMN `informacionCliente` TEXT NULL;

-- AddForeignKey
ALTER TABLE `IngresoPorVenta` ADD CONSTRAINT `IngresoPorVenta_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
