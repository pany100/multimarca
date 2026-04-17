-- CreateTable
CREATE TABLE `DocumentoGeneral` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `CustomFile` ADD COLUMN `documentoGeneralId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CustomFile_documentoGeneralId_key` ON `CustomFile`(`documentoGeneralId`);

-- AddForeignKey
ALTER TABLE `CustomFile` ADD CONSTRAINT `CustomFile_documentoGeneralId_fkey` FOREIGN KEY (`documentoGeneralId`) REFERENCES `DocumentoGeneral`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
