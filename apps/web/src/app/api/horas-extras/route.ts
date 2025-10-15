import { CreateHoraExtraUseCase } from "@/core/application/use-cases/horas-extras/create-hora-extra.use-case";
import { PrismaHoraExtraRepository } from "@/core/infrastructure/database/repositories/prisma-hora-extra.repository";
import { createHoraExtraSchema } from "@/core/infrastructure/validation/schemas/hora-extra.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createHoraExtraSchema);
    const result = await new CreateHoraExtraUseCase(
      new PrismaHoraExtraRepository()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
