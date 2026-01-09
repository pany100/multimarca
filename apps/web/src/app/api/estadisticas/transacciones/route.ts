import { EstadisticaServiceFactory } from "@/core/application/factory/estadistica-service.factory";
import { GetTransaccionesUseCase } from "@/core/application/use-cases/estadisticas/get-transacciones.use-case";
import { getByFechaQuerySchema } from "@/core/infrastructure/validation/schemas/estadisticas.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        año: searchParams.get("año"),
        mes: searchParams.get("mes"),
      },
      getByFechaQuerySchema
    );
    const result = await new GetTransaccionesUseCase(
      EstadisticaServiceFactory.create()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}
