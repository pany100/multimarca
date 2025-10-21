import { GetTotalReparacionesService } from "@/core/application/services/get-total-reparaciones.service";
import { GetTotalReparacionesUseCase } from "@/core/application/use-cases/precios/get-total-reparaciones.use-case";
import { precioFinalReparacionesSchema } from "@/core/infrastructure/validation/schemas/precio.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, precioFinalReparacionesSchema);

    const result = await new GetTotalReparacionesUseCase(
      new GetTotalReparacionesService()
    ).execute(dto);

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
