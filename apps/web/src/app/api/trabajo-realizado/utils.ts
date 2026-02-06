/**
 * Normaliza el registro de TrabajoRealizado para la respuesta API:
 * diasParaRecordatorio siempre como number[] | null (por si viene como Json/legacy).
 */
export function normalizeTrabajoRealizadoResponse(tr: {
  diasParaRecordatorio?: unknown;
  [key: string]: unknown;
}) {
  if (!tr) return tr;
  const raw = tr.diasParaRecordatorio;
  const diasParaRecordatorio: number[] | null = Array.isArray(raw)
    ? raw.map(Number)
    : raw != null
      ? [Number(raw)]
      : null;
  return { ...tr, diasParaRecordatorio };
}
