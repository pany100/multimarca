import { UpdateMecanicoInOrdenUseCase } from "@/core/application/use-cases/orden-reparacion/update-mecanico-in-orden.use-case";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { updateMecanicoInOrdenSchema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; mecanicoId: string } }
) {
  try {
    const body = await request.json();
    const dto = await validateRequest(
      {
        id: params.mecanicoId,
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
