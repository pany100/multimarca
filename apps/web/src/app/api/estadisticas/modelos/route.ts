import { EstadisticaServiceFactory } from "@/core/application/factory/estadistica-service.factory";
import { GetModelosPorMarcaUseCase } from "@/core/application/use-cases/estadisticas/get-modelos-por-marca.use-case";
import { getModelosPorMarcaQuerySchema } from "@/core/infrastructure/validation/schemas/estadisticas.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        año: searchParams.get("año"),
        mes: searchParams.get("mes"),
        marca: searchParams.get("marca"),
      },
      getModelosPorMarcaQuerySchema
    );

    const result = await new GetModelosPorMarcaUseCase(
      EstadisticaServiceFactory.create()
    ).execute(dto);

    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

