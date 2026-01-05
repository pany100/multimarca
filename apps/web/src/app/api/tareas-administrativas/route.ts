import { CreateTareaAdministrativaUseCase } from "@/core/application/use-cases/tarea-administrativa/create-tarea-administrativa.use-case";
import { PrismaTareaAdministrativaRepository } from "@/core/infrastructure/database/repositories/prisma-tarea-administrativa.repository";
import { createTareaAdministrativaSchema } from "@/core/infrastructure/validation/schemas/tarea-administrativa.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createTareaAdministrativaSchema);

    const useCase = new CreateTareaAdministrativaUseCase(
      new PrismaTareaAdministrativaRepository()
    );

    const result = await useCase.execute(dto);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
