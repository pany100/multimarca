import { EstadisticaServiceFactory } from "@/core/application/factory/estadistica-service.factory";
import { GetBalanceUseCase } from "@/core/application/use-cases/estadisticas/get-balance.use-case";
import { balanceGeneralQuerySchema } from "@/core/infrastructure/validation/schemas/estadisticas.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

interface VentasResult {
  totalVentas: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        moneda: searchParams.get("moneda") || "ARS",
        año: searchParams.get("año"),
        mes: searchParams.get("mes"),
      },
      balanceGeneralQuerySchema
    );
    const result = await new GetBalanceUseCase(
      EstadisticaServiceFactory.create()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    handleApiError(e);
  }
}
