-- AlterTable
ALTER TABLE `AjustePrecio` ADD COLUMN `ordenDeCompraId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `AjustePrecio_ordenDeCompraId_idx` ON `AjustePrecio`(`ordenDeCompraId`);

-- AddForeignKey
ALTER TABLE `AjustePrecio` ADD CONSTRAINT `AjustePrecio_ordenDeCompraId_fkey` FOREIGN KEY (`ordenDeCompraId`) REFERENCES `OrdenDeCompra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
