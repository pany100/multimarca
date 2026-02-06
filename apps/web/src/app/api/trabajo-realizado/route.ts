import { AddTrabajoRealizadoUseCase } from "@/core/application/use-cases/trabajo-realizado/add-trabajo-realizado.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaTrabajoRealizadoRepository } from "@/core/infrastructure/database/repositories/prisma-trabajo-realizado.repository";
import { addTrabajoRealizadoSchema } from "@/core/infrastructure/validation/schemas/trabajo-realizado.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";
import { normalizeTrabajoRealizadoResponse } from "./utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, addTrabajoRealizadoSchema);

    const useCase = new AddTrabajoRealizadoUseCase(
      new PrismaTrabajoRealizadoRepository(),
      new PrismaUnitOfWork()
    );

    const result = await useCase.execute(dto);
    return NextResponse.json(normalizeTrabajoRealizadoResponse(result), {
      status: 201,
    });
  } catch (e) {
    return handleApiError(e);
  }
}
