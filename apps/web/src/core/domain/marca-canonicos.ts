/**
 * Marcas que en la base pueden aparecer con distintas grafías.
 * Clave = nombre canónico (el que mostramos). Valor = variantes a considerar iguales.
 */
const MARCA_ALIASES: Record<string, string[]> = {
  CITROEN: ["CITROEN", "CITRÖEN", "CITROËN"],
};

/** Mapa variante (upper) -> canónico para normalizar */
const ALIAS_TO_CANONICAL: Map<string, string> = new Map();
for (const [canonical, aliases] of Object.entries(MARCA_ALIASES)) {
  for (const a of aliases) {
    ALIAS_TO_CANONICAL.set(a.toUpperCase().trim(), canonical);
  }
}

/**
 * Devuelve el nombre canónico de la marca (para listados y estadísticas unificadas).
 */
export function normalizeMarcaToCanonical(marca: string): string {
  const trimmed = marca?.trim() ?? "";
  if (!trimmed) return trimmed;
  const upper = trimmed.toUpperCase();
  return ALIAS_TO_CANONICAL.get(upper) ?? upper;
}

/**
 * Devuelve todas las variantes de la marca para usarlas en consultas (ej. WHERE brand IN (...)).
 */
export function getMarcaAliasesForQuery(canonical: string): string[] {
  const key = canonical.toUpperCase().trim();
  return MARCA_ALIASES[key] ?? [key];
}
