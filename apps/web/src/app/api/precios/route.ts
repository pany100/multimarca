import { GetPreciosService } from "@/core/application/services/get-precios.service";
import { GetPreciosUseCase } from "@/core/application/use-cases/precios/get-precios.use-case";
import { precioSchema } from "@/core/infrastructure/validation/schemas/precio.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, precioSchema);

    const result = await new GetPreciosUseCase(new GetPreciosService()).execute(
      dto
    );

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
