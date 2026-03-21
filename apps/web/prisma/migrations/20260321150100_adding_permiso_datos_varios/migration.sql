-- Permiso para la sección Datos varios
INSERT IGNORE INTO `Permiso` (`name`) VALUES ('DatosVarios');

-- Asignar al rol Administrador si existe (evita duplicados en la tabla implícita)
INSERT INTO `_PermisoToRol` (`A`, `B`)
SELECT p.`id`, r.`id`
FROM `Permiso` p
CROSS JOIN `Rol` r
WHERE p.`name` = 'DatosVarios' AND r.`name` = 'Administrador'
AND NOT EXISTS (
  SELECT 1 FROM `_PermisoToRol` x WHERE x.`A` = p.`id` AND x.`B` = r.`id`
);
