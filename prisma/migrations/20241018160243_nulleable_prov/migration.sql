-- DropIndex
DROP INDEX `Proveedor_numeroProveedor_key` ON `Proveedor`;

-- AlterTable
ALTER TABLE `Dolar` ALTER COLUMN `fecha` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Proveedor` MODIFY `numeroProveedor` INTEGER NULL;
