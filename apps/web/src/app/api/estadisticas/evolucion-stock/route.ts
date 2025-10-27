import { GetEvolucionStockUseCase } from "@/core/application/use-cases/estadisticas/get-evolucion-stock.case";
import { EstadisticasEvolucionStockService } from "@/core/infrastructure/database/queries/estadisticas-evolucion-stock.service";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const result = await new GetEvolucionStockUseCase(
      new EstadisticasEvolucionStockService()
    ).execute();
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}