-- DropForeignKey
ALTER TABLE `OrdenDeCompraItem` DROP FOREIGN KEY `OrdenDeCompraItem_ordenDeCompraId_fkey`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `OrdenDeCompraItem` ADD CONSTRAINT `OrdenDeCompraItem_ordenDeCompraId_fkey` FOREIGN KEY (`ordenDeCompraId`) REFERENCES `OrdenDeCompra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
