import { CreateInasistenciaUseCase } from "@/core/application/use-cases/inasistencias/create-inasistencia.use-case";
import { PrismaInasistenciaRepository } from "@/core/infrastructure/database/repositories/prisma-inasistencia.repository";
import { createInasistenciaSchema } from "@/core/infrastructure/validation/schemas/inasistencia.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createInasistenciaSchema);
    const result = await new CreateInasistenciaUseCase(
      new PrismaInasistenciaRepository()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
