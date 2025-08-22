-- AlterTable
ALTER TABLE `ControlMecanico` ADD COLUMN `parentId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `ControlMecanico_parentId_idx` ON `ControlMecanico`(`parentId`);

-- AddForeignKey
ALTER TABLE `ControlMecanico` ADD CONSTRAINT `ControlMecanico_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `ControlMecanico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
