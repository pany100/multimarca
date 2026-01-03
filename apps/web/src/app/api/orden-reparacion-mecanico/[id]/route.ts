import { DeleteMecanicoFromOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/delete-mecanico-from-orden.use-case";
import { UpdateMecanicoInOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/update-mecanico-in-orden.use-case";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import {
  deleteMecanicoFromOrdenSchema,
  updateMecanicoInOrdenSchema,
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
      updateMecanicoInOrdenSchema
    );

    const useCase = new UpdateMecanicoInOrdenUseCase(
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
      deleteMecanicoFromOrdenSchema
    );

    const useCase = new DeleteMecanicoFromOrdenUseCase(
      new PrismaOrdenReparacionRepository()
    );

    await useCase.execute(dto);
    return NextResponse.json({ mensaje: "Mecánico eliminado de la orden" });
  } catch (e) {
    return handleApiError(e);
  }
}
