import { GetPreciosFinalRepuestosService } from "@/core/application/services/get-precios-final-repuestos.service";
import { GetPreciosFinalRepuestosUseCase } from "@/core/application/use-cases/precios/get-precios-final-repuestos.use-case";
import { precioFinalRepuestosSchema } from "@/core/infrastructure/validation/schemas/precio.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, precioFinalRepuestosSchema);

    const result = await new GetPreciosFinalRepuestosUseCase(
      new GetPreciosFinalRepuestosService()
    ).execute(dto);

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
