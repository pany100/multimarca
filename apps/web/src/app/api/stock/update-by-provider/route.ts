import { UpdateStockPricesByProveedorUseCase } from "@/core/application/use-cases/stock/update-stock-prices-by-proveedor.use-case";
import { PrismaStockRepository } from "@/core/infrastructure/database/repositories/prisma-stock.repository";
import { updateStockPricesByProveedorSchema } from "@/core/infrastructure/validation/schemas/stock.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, updateStockPricesByProveedorSchema);
    const result = await new UpdateStockPricesByProveedorUseCase(
      new PrismaStockRepository()
    ).execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
