import { AddReparacionTerceroUseCase } from "@/core/application/use-cases/orden-reparacion/add-reparacion-tercero.use-case";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { addReparacionTerceroSchema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, addReparacionTerceroSchema);

    const useCase = new AddReparacionTerceroUseCase(
      new PrismaOrdenReparacionRepository()
    );

    const result = await useCase.execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
