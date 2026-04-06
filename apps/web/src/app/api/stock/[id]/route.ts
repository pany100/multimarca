import { DeleteStockUseCase } from "@/core/application/use-cases/stock/delete-stock.use-case";
import { GetStockUseCase } from "@/core/application/use-cases/stock/get-stock.use-case";
import { UpdateStockUseCase } from "@/core/application/use-cases/stock/update-stock.use-case";
import { PrismaStockRepository } from "@/core/infrastructure/database/repositories/prisma-stock.repository";
import {
  getStockParamsSchema,
  updateStockSchema,
} from "@/core/infrastructure/validation/schemas/stock.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await validateRequest(params, getStockParamsSchema);
    const stock = await new GetStockUseCase(new PrismaStockRepository()).execute(
      id
    );
    return NextResponse.json(stock, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = await validateRequest(params, getStockParamsSchema);
    const dto = await validateRequest(body, updateStockSchema);
    const updated = await new UpdateStockUseCase(
      new PrismaStockRepository()
    ).execute(id, dto);
    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await validateRequest(params, getStockParamsSchema);
    const result = await new DeleteStockUseCase(
      new PrismaStockRepository()
    ).execute(id);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
