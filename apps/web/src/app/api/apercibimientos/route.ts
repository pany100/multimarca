import { CreateApercibimientoUseCase } from "@/core/application/use-cases/apercibimientos/create-apercibimiento.use-case";
import { PrismaApercibimientoRepository } from "@/core/infrastructure/database/repositories/prisma-apercibimiento.repository";
import { createApercibimientoSchema } from "@/core/infrastructure/validation/schemas/apercibimiento.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createApercibimientoSchema);
    const result = await new CreateApercibimientoUseCase(
      new PrismaApercibimientoRepository()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
