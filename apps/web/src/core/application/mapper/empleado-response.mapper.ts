/**
 * Resuelve la ruta de un CustomFile para la respuesta API (finalPath ?? tempPath).
 * El frontend recibe siempre un string, sin conocer la implementación con CustomFile.
 */
export function getDocPath(
  doc: { finalPath?: string | null; tempPath: string } | null,
): string | null {
  if (!doc) return null;
  return doc.finalPath ?? doc.tempPath ?? null;
}

type CustomFileLike = { finalPath?: string | null; tempPath: string };

type EmpleadoWithDocRelations = {
  [key: string]: unknown;
  licenciaConducirPath?: { finalPath?: string | null; tempPath: string } | null;
  licenciaDorsoPath?: { finalPath?: string | null; tempPath: string } | null;
  inscripcionMonotributoPath?: {
    finalPath?: string | null;
    tempPath: string;
  } | null;
  recategorizacionMonotributoPath?: {
    finalPath?: string | null;
    tempPath: string;
  } | null;
  curriculumPath?: { finalPath?: string | null; tempPath: string } | null;
  credencialPagoPath?: { finalPath?: string | null; tempPath: string } | null;
  dniFrentePath?: { finalPath?: string | null; tempPath: string } | null;
  dniDorsoPath?: { finalPath?: string | null; tempPath: string } | null;
};

/**
 * Mapea un empleado (con relaciones CustomFile) a la respuesta API,
 * exponiendo licenciaConducirPath, inscripcionMonotributoPath,
 * recategorizacionMonotributoPath y curriculumPath como string | null.
 */
export function mapEmpleadoToResponse<T extends EmpleadoWithDocRelations>(
  empleado: T,
): Omit<
  T,
  | "licenciaConducirPath"
  | "licenciaDorsoPath"
  | "inscripcionMonotributoPath"
  | "recategorizacionMonotributoPath"
  | "curriculumPath"
  | "credencialPagoPath"
  | "dniFrentePath"
  | "dniDorsoPath"
> & {
  licenciaConducirPath: string | null;
  licenciaDorsoPath: string | null;
  inscripcionMonotributoPath: string | null;
  recategorizacionMonotributoPath: string | null;
  curriculumPath: string | null;
  credencialPagoPath: string | null;
  dniFrentePath: string | null;
  dniDorsoPath: string | null;
} {
  const {
    licenciaConducirPath: lc,
    licenciaDorsoPath: ld,
    inscripcionMonotributoPath: im,
    recategorizacionMonotributoPath: rm,
    curriculumPath: cv,
    credencialPagoPath: cpago,
    dniFrentePath: dfr,
    dniDorsoPath: ddo,
    ...rest
  } = empleado;
  type MappedReturn = Omit<
    T,
    | "licenciaConducirPath"
    | "licenciaDorsoPath"
    | "inscripcionMonotributoPath"
    | "recategorizacionMonotributoPath"
    | "curriculumPath"
    | "credencialPagoPath"
    | "dniFrentePath"
    | "dniDorsoPath"
  > & {
    licenciaConducirPath: string | null;
    licenciaDorsoPath: string | null;
    inscripcionMonotributoPath: string | null;
    recategorizacionMonotributoPath: string | null;
    curriculumPath: string | null;
    credencialPagoPath: string | null;
    dniFrentePath: string | null;
    dniDorsoPath: string | null;
  };
  const mapped: MappedReturn = {
    ...rest,
    licenciaConducirPath: getDocPath(lc ?? null),
    licenciaDorsoPath: getDocPath(ld ?? null),
    inscripcionMonotributoPath: getDocPath(im ?? null),
    recategorizacionMonotributoPath: getDocPath(rm ?? null),
    curriculumPath: getDocPath(cv ?? null),
    credencialPagoPath: getDocPath(cpago ?? null),
    dniFrentePath: getDocPath(dfr ?? null),
    dniDorsoPath: getDocPath(ddo ?? null),
  };
  const out = mapped as MappedReturn & {
    certificadosEstudio?: unknown[];
    inasistencias?: unknown[];
    llegadasTarde?: unknown[];
  };
  if (Array.isArray(out.certificadosEstudio)) {
    out.certificadosEstudio = out.certificadosEstudio.map((c) =>
      mapCertificadoEstudioToResponse(c as Record<string, unknown>),
    );
  }
  if (Array.isArray(out.inasistencias)) {
    out.inasistencias = out.inasistencias.map((ina) =>
      mapInasistenciaToResponse(ina as Record<string, unknown>),
    );
  }
  if (Array.isArray(out.llegadasTarde)) {
    out.llegadasTarde = out.llegadasTarde.map((lt) =>
      mapLlegadaTardeToResponse(lt as Record<string, unknown>),
    );
  }
  return out as MappedReturn;
}

/** Mapea LlegadaTarde para exponer certificadoPath como string. Acepta CustomFile o string (idempotente). */
export function mapLlegadaTardeToResponse(
  lt: { certificadoPath?: CustomFileLike | string | null } & Record<
    string,
    unknown
  >,
) {
  const { certificadoPath: cp, ...rest } = lt;
  const path = typeof cp === "string" ? cp : getDocPath(cp ?? null);
  return { ...rest, certificadoPath: path ?? null };
}

/** Mapea Inasistencia para exponer certificadoMedicoPath como string. Acepta CustomFile o string (idempotente). */
export function mapInasistenciaToResponse(
  ina: { certificadoMedicoPath?: CustomFileLike | string | null } & Record<
    string,
    unknown
  >,
) {
  const { certificadoMedicoPath: cmp, ...rest } = ina;
  const path = typeof cmp === "string" ? cmp : getDocPath(cmp ?? null);
  return { ...rest, certificadoMedicoPath: path ?? null };
}

/** Mapea CertificadoEstudio para exponer ruta como string. Acepta CustomFile o string (idempotente). */
export function mapCertificadoEstudioToResponse(
  ce: { ruta?: CustomFileLike | string | null } & Record<string, unknown>,
) {
  const { ruta: r, ...rest } = ce;
  const path = typeof r === "string" ? r : getDocPath(r ?? null);
  return { ...rest, ruta: path ?? null };
}
