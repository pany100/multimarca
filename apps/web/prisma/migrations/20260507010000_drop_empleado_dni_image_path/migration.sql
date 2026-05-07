-- Drop legacy column. All Empleado rows already have their DNI migrated to CustomFile
-- via empleadoDniFrenteId, so no backfill is needed.
ALTER TABLE `Empleado` DROP COLUMN `dniImagePath`;
