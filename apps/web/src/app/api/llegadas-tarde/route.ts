import { mapLlegadaTardeToResponse } from "@/core/application/mapper/empleado-response.mapper";
import { CreateLlegadaTardeUseCase } from "@/core/application/use-cases/llegadas-tarde/create-llegada-tarde.use-case";
import { PrismaLlegadaTardeRepository } from "@/core/infrastructure/database/repositories/prisma-llegada-tarde.repository";
import { createLlegadaTardeSchema } from "@/core/infrastructure/validation/schemas/llegada-tarde.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createLlegadaTardeSchema);
    const result = await new CreateLlegadaTardeUseCase(
      new PrismaLlegadaTardeRepository()
    ).execute(dto);
    return NextResponse.json(mapLlegadaTardeToResponse(result));
  } catch (e) {
    return handleApiError(e);
  }
}
