import { normalizeMarcaToCanonical } from "@/core/domain/marca-canonicos";
import { prisma } from "@/core/infrastructure/database/prisma";

export class GetMarcasUseCase {
  constructor() {}

  async execute(): Promise<string[]> {
    const rows = await prisma.auto.findMany({
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    });

    const trimmed = rows
      .map((row) => row.brand?.trim())
      .filter((marca): marca is string => Boolean(marca && marca.length > 0));

    // Unificar por canónico (mayúsculas + alias, ej. CITROEN y CITRÖEN → CITROEN)
    const unicos = new Map<string, string>();
    for (const m of trimmed) {
      const canonico = normalizeMarcaToCanonical(m);
      if (!unicos.has(canonico)) unicos.set(canonico, canonico);
    }

    return Array.from(unicos.values()).sort((a, b) =>
      a.localeCompare(b, "es")
    );
  }
}

