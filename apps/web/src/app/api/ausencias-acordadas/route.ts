import { CreateAusenciaAcordadaUseCase } from "@/core/application/use-cases/ausencias-acordadas/create-ausencia-acordada.use-case";
import { PrismaAusenciaProgramadaRepository } from "@/core/infrastructure/database/repositories/prisma-ausencia-programada.repository";
import { createAusenciaProgramadaSchema } from "@/core/infrastructure/validation/schemas/ausencia.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(
      {
        ...body,
        fechaCreacion: new Date(),
      },
      createAusenciaProgramadaSchema
    );
    const result = await new CreateAusenciaAcordadaUseCase(
      new PrismaAusenciaProgramadaRepository()
    ).execute(dto);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
