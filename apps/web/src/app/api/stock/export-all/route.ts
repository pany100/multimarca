import { ListAllStockUseCase } from "@/core/application/use-cases/stock/list-all-stock.use-case";
import { PrismaStockRepository } from "@/core/infrastructure/database/repositories/prisma-stock.repository";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const stocks = await new ListAllStockUseCase(
      new PrismaStockRepository()
    ).execute();
    return NextResponse.json(stocks, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
