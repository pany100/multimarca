/**
 * Resuelve la ruta de un CustomFile para la respuesta API (finalPath ?? tempPath).
 * El frontend recibe siempre un string, sin conocer la implementación con CustomFile.
 */
function getDocPath(
  doc: { finalPath?: string | null; tempPath: string } | null
): string | null {
  if (!doc) return null;
  return doc.finalPath ?? doc.tempPath ?? null;
}

type EmpleadoWithDocRelations = {
  [key: string]: unknown;
  licenciaConducirPath?: { finalPath?: string | null; tempPath: string } | null;
  inscripcionMonotributoPath?: { finalPath?: string | null; tempPath: string } | null;
  recategorizacionMonotributoPath?: { finalPath?: string | null; tempPath: string } | null;
  curriculumPath?: { finalPath?: string | null; tempPath: string } | null;
};

/**
 * Mapea un empleado (con relaciones CustomFile) a la respuesta API,
 * exponiendo licenciaConducirPath, inscripcionMonotributoPath,
 * recategorizacionMonotributoPath y curriculumPath como string | null.
 */
export function mapEmpleadoToResponse<T extends EmpleadoWithDocRelations>(
  empleado: T
): Omit<T, "licenciaConducirPath" | "inscripcionMonotributoPath" | "recategorizacionMonotributoPath" | "curriculumPath"> & {
  licenciaConducirPath: string | null;
  inscripcionMonotributoPath: string | null;
  recategorizacionMonotributoPath: string | null;
  curriculumPath: string | null;
} {
  const {
    licenciaConducirPath: lc,
    inscripcionMonotributoPath: im,
    recategorizacionMonotributoPath: rm,
    curriculumPath: cv,
    ...rest
  } = empleado;
  return {
    ...rest,
    licenciaConducirPath: getDocPath(lc ?? null),
    inscripcionMonotributoPath: getDocPath(im ?? null),
    recategorizacionMonotributoPath: getDocPath(rm ?? null),
    curriculumPath: getDocPath(cv ?? null),
  } as Omit<T, "licenciaConducirPath" | "inscripcionMonotributoPath" | "recategorizacionMonotributoPath" | "curriculumPath"> & {
    licenciaConducirPath: string | null;
    inscripcionMonotributoPath: string | null;
    recategorizacionMonotributoPath: string | null;
    curriculumPath: string | null;
  };
}
