import { GetMarcasUseCase } from "@/core/application/use-cases/marcas/get-marcas.use-case";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  try {
    const marcas = await new GetMarcasUseCase().execute();
    return NextResponse.json(marcas);
  } catch (e) {
    return handleApiError(e);
  }
}

