-- DropForeignKey
ALTER TABLE `OrdenReparacionMecanico` DROP FOREIGN KEY `OrdenReparacionMecanico_mecanicoId_fkey`;

-- AddForeignKey
ALTER TABLE `OrdenReparacionMecanico` ADD CONSTRAINT `OrdenReparacionMecanico_mecanicoId_fkey` FOREIGN KEY (`mecanicoId`) REFERENCES `Empleado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
