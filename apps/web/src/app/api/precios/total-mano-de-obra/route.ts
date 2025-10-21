import {
  GetTotalManoDeObraService,
  totalManoDeObraSchema,
} from "@/core/application/services/get-total-mano-de-obra.service";
import { GetTotalManoDeObraUseCase } from "@/core/application/use-cases/precios/get-total-mano-de-obra.use-case";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, totalManoDeObraSchema);

    const result = await new GetTotalManoDeObraUseCase(
      new GetTotalManoDeObraService()
    ).execute(dto);

    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}
