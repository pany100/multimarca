export function parseIdParam(idRaw: string): number {
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id < 1) throw new Error("ID inválido");
  return id;
}
