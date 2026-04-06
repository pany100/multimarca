import { CreateStockUseCase } from "@/core/application/use-cases/stock/create-stock.use-case";
import { ListStockUseCase } from "@/core/application/use-cases/stock/list-stock.use-case";
import { PrismaStockRepository } from "@/core/infrastructure/database/repositories/prisma-stock.repository";
import {
  createStockSchema,
  listStockQuerySchema,
} from "@/core/infrastructure/validation/schemas/stock.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        page: searchParams.get("page") || "0",
        size: searchParams.get("pageSize") || searchParams.get("size") || "10",
        query: searchParams.get("query") || "",
        needsRestock: searchParams.get("needsRestock") === "true",
        proveedorId: searchParams.get("proveedorId"),
        sortBy: searchParams.get("sortBy") || "id",
        sortOrder: searchParams.get("sortOrder") || "desc",
      },
      listStockQuerySchema
    );

    const result = await new ListStockUseCase(
      new PrismaStockRepository()
    ).execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createStockSchema);
    const created = await new CreateStockUseCase(
      new PrismaStockRepository()
    ).execute(dto);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
