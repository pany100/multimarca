-- DropForeignKey
ALTER TABLE `TareaAdministrativa` DROP FOREIGN KEY `TareaAdministrativa_presupuestoId_fkey`;

-- AddForeignKey
ALTER TABLE `TareaAdministrativa` ADD CONSTRAINT `TareaAdministrativa_presupuestoId_fkey` FOREIGN KEY (`presupuestoId`) REFERENCES `Presupuesto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
