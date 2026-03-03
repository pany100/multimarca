-- AlterTable: add new columns
ALTER TABLE `Turno` ADD COLUMN `clienteNombre` TEXT NULL,
    ADD COLUMN `clienteTelefono` VARCHAR(50) NULL,
    ADD COLUMN `vino` BOOLEAN NULL,
    ADD COLUMN `observaciones` TEXT NULL;

-- Migrate existing informacionCliente to clienteNombre
UPDATE `Turno` SET `clienteNombre` = `informacionCliente` WHERE `informacionCliente` IS NOT NULL;

-- DropColumn
ALTER TABLE `Turno` DROP COLUMN `informacionCliente`;
