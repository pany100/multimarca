import { GetProveedoresUseCase } from "@/core/application/use-cases/estadisticas/get-proveedores.case";
import { EstadisticasProveedoresService } from "@/core/infrastructure/database/queries/estadisticas-proveedores.service";
import { dateRangeSchema } from "@/core/infrastructure/validation/schemas/estadisticas.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dto = await validateRequest(
      {
        from: searchParams.get("from")
          ? new Date(searchParams.get("from") as string)
          : undefined,
        to: searchParams.get("to")
          ? new Date(searchParams.get("to") as string)
          : undefined,
      },
      dateRangeSchema
    );
    const result = await new GetProveedoresUseCase(
      new EstadisticasProveedoresService()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
