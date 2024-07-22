-- DropForeignKey
ALTER TABLE `VentaItem` DROP FOREIGN KEY `VentaItem_ventaId_fkey`;

-- AddForeignKey
ALTER TABLE `VentaItem` ADD CONSTRAINT `VentaItem_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
