-- AlterTable
ALTER TABLE `Empleado` ADD COLUMN `contactoEmergencia` VARCHAR(150) NULL,
    ADD COLUMN `curriculumPath` VARCHAR(1000) NULL,
    ADD COLUMN `inscripcionMonotributoPath` VARCHAR(1000) NULL,
    ADD COLUMN `licenciaConducirPath` VARCHAR(1000) NULL,
    ADD COLUMN `notasAdministrativas` TEXT NULL,
    ADD COLUMN `recategorizacionesMonotributoPath` VARCHAR(1000) NULL;
