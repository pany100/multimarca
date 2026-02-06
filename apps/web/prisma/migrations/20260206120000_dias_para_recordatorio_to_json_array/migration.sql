-- Cambiar diasParaRecordatorio de Int? a JSON (array de enteros) preservando datos.
-- Valores actuales (un solo día) se convierten a array de un elemento, ej: 30 -> [30].

ALTER TABLE `TrabajoRealizado` ADD COLUMN `diasParaRecordatorio_new` JSON NULL;

UPDATE `TrabajoRealizado`
SET `diasParaRecordatorio_new` = JSON_ARRAY(`diasParaRecordatorio`)
WHERE `diasParaRecordatorio` IS NOT NULL;

ALTER TABLE `TrabajoRealizado` DROP COLUMN `diasParaRecordatorio`;

ALTER TABLE `TrabajoRealizado` CHANGE COLUMN `diasParaRecordatorio_new` `diasParaRecordatorio` JSON NULL;
