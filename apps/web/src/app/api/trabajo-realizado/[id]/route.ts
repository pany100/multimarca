import { DeleteTrabajoRealizadoUseCase } from "@/core/application/use-cases/trabajo-realizado/delete-trabajo-realizado.use-case";
import { UpdateTrabajoRealizadoUseCase } from "@/core/application/use-cases/trabajo-realizado/update-trabajo-realizado.use-case";
import { PrismaUnitOfWork } from "@/core/infrastructure/database/prisma-uow";
import { PrismaTrabajoRealizadoRepository } from "@/core/infrastructure/database/repositories/prisma-trabajo-realizado.repository";
import {
  deleteTrabajoRealizadoSchema,
  updateTrabajoRealizadoSchema,
} from "@/core/infrastructure/validation/schemas/trabajo-realizado.schema";
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
      { id: params.id, ...body },
      updateTrabajoRealizadoSchema
    );

    const useCase = new UpdateTrabajoRealizadoUseCase(
      new PrismaTrabajoRealizadoRepository(),
      new PrismaUnitOfWork()
    );

    const result = await useCase.execute(dto);
    return NextResponse.json(result);
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
      deleteTrabajoRealizadoSchema
    );

    const useCase = new DeleteTrabajoRealizadoUseCase(
      new PrismaTrabajoRealizadoRepository()
    );

    await useCase.execute(dto);
    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
