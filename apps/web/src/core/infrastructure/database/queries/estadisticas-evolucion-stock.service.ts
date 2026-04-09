import { prisma } from "@/core/infrastructure/database/prisma";

type EvolucionStockRow = {
  costoStock: number | bigint | string;
  plataEnStock: number | bigint | string;
};

export class EstadisticasEvolucionStockService {
  constructor() {}

  async getEvolucionStock(): Promise<EvolucionStockRow[]> {
    return await prisma.$queryRaw<EvolucionStockRow[]>`
      SELECT 
        SUM(s.buyPrice * s.units) as costoStock,
        SUM((s.buyPrice * (1 + COALESCE(s.markup, 0) / 100) * (1 + COALESCE(s.sellIva, 0) / 100)) * s.units) as plataEnStock
      FROM Stock s
      WHERE s.units > 0;
    `;
  }
}
