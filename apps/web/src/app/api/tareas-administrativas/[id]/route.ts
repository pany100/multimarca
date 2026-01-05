import { DeleteTareaAdministrativaUseCase } from "@/core/application/use-cases/tarea-administrativa/delete-tarea-administrativa.use-case";
import { UpdateTareaAdministrativaUseCase } from "@/core/application/use-cases/tarea-administrativa/update-tarea-administrativa.use-case";
import { PrismaTareaAdministrativaRepository } from "@/core/infrastructure/database/repositories/prisma-tarea-administrativa.repository";
import {
  deleteTareaAdministrativaSchema,
  updateTareaAdministrativaSchema,
} from "@/core/infrastructure/validation/schemas/tarea-administrativa.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const dto = await validateRequest(
      { ...body, id: params.id },
      updateTareaAdministrativaSchema
    );

    const useCase = new UpdateTareaAdministrativaUseCase(
      new PrismaTareaAdministrativaRepository()
    );

    const result = await useCase.execute(dto);
    return NextResponse.json(result, { status: 200 });
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      { id: params.id },
      deleteTareaAdministrativaSchema
    );

    const useCase = new DeleteTareaAdministrativaUseCase(
      new PrismaTareaAdministrativaRepository()
    );

    await useCase.execute(dto);
    return NextResponse.json(
      { message: "Tarea administrativa eliminada correctamente" },
      { status: 200 }
    );
  } catch (e) {
    return handleApiError(e);
  }
}
