import { DeleteReparacionTerceroUseCase } from "@/core/application/use-cases/orden-reparacion/delete-reparacion-tercero.use-case";
import { UpdateReparacionTerceroUseCase } from "@/core/application/use-cases/orden-reparacion/update-reparacion-tercero.use-case";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import {
  deleteReparacionTerceroSchema,
  updateReparacionTerceroSchema,
} from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
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
      {
        id: params.id,
        ...body,
      },
      updateReparacionTerceroSchema
    );

    const useCase = new UpdateReparacionTerceroUseCase(
      new PrismaOrdenReparacionRepository()
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
      {
        id: params.id,
      },
      deleteReparacionTerceroSchema
    );

    const useCase = new DeleteReparacionTerceroUseCase(
      new PrismaOrdenReparacionRepository()
    );

    await useCase.execute(dto);
    return NextResponse.json({
      mensaje: "Reparación de tercero eliminada",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
