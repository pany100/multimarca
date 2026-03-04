/**
 * Resuelve la ruta de un CustomFile para la respuesta API (finalPath ?? tempPath).
 * El frontend recibe siempre un string, sin conocer la implementación con CustomFile.
 */
export function getDocPath(
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
  const mapped = {
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
  if (Array.isArray(mapped.certificadosEstudio)) {
    mapped.certificadosEstudio = mapped.certificadosEstudio.map((c: { ruta?: { finalPath?: string | null; tempPath: string } | null }) => ({
      ...c,
      ruta: getDocPath(c.ruta ?? null),
    }));
  }
  if (Array.isArray(mapped.inasistencias)) {
    mapped.inasistencias = mapped.inasistencias.map((ina: { certificadoMedicoPath?: { finalPath?: string | null; tempPath: string } | null } & Record<string, unknown>) =>
      mapInasistenciaToResponse(ina)
    );
  }
  if (Array.isArray(mapped.llegadasTarde)) {
    mapped.llegadasTarde = mapped.llegadasTarde.map((lt: { certificadoPath?: { finalPath?: string | null; tempPath: string } | null } & Record<string, unknown>) =>
      mapLlegadaTardeToResponse(lt)
    );
  }
  return mapped;
}

/** Mapea LlegadaTarde para exponer certificadoPath como string */
export function mapLlegadaTardeToResponse(lt: { certificadoPath?: { finalPath?: string | null; tempPath: string } | null } & Record<string, unknown>) {
  const { certificadoPath: cp, ...rest } = lt;
  return { ...rest, certificadoPath: getDocPath(cp ?? null) };
}

/** Mapea Inasistencia para exponer certificadoMedicoPath como string */
export function mapInasistenciaToResponse(ina: { certificadoMedicoPath?: { finalPath?: string | null; tempPath: string } | null } & Record<string, unknown>) {
  const { certificadoMedicoPath: cmp, ...rest } = ina;
  return { ...rest, certificadoMedicoPath: getDocPath(cmp ?? null) };
}

/** Mapea CertificadoEstudio para exponer ruta como string */
export function mapCertificadoEstudioToResponse(ce: { ruta?: { finalPath?: string | null; tempPath: string } | null } & Record<string, unknown>) {
  const { ruta: r, ...rest } = ce;
  return { ...rest, ruta: getDocPath(r ?? null) };
}
