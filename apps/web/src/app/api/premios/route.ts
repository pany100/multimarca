import { CreatePremioUseCase } from "@/core/application/use-cases/premios/create-premio.use-case";
import { PrismaPremioRepository } from "@/core/infrastructure/database/repositories/prisma-premio.repository";
import { createPremioSchema } from "@/core/infrastructure/validation/schemas/premio.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createPremioSchema);
    const result = await new CreatePremioUseCase(
      new PrismaPremioRepository()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
