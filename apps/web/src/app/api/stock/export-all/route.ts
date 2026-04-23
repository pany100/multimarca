import { ListAllStockUseCase } from "@/core/application/use-cases/stock/list-all-stock.use-case";
import { PrismaStockRepository } from "@/core/infrastructure/database/repositories/prisma-stock.repository";
import { exportStockQuerySchema } from "@/core/infrastructure/validation/schemas/stock.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        query: searchParams.get("query") || "",
        needsRestock: searchParams.get("needsRestock") === "true",
        proveedorId: searchParams.get("proveedorId"),
        sector: searchParams.get("sector") || "",
      },
      exportStockQuerySchema
    );

    const stocks = await new ListAllStockUseCase(
      new PrismaStockRepository()
    ).execute(dto);
    return NextResponse.json(stocks, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
