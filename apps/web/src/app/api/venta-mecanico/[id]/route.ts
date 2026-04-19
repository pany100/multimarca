import { DeleteMecanicoFromVentaUseCase } from "@/core/application/use-cases/venta/delete-mecanico-from-venta.use-case";
import { UpdateMecanicoInVentaUseCase } from "@/core/application/use-cases/venta/update-mecanico-in-venta.use-case";
import { PrismaVentaRepository } from "@/core/infrastructure/database/repositories/prisma-venta.repository";
import {
  deleteMecanicoFromVentaSchema,
  updateMecanicoInVentaSchema,
} from "@/core/infrastructure/validation/schemas/venta.schema";
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
      updateMecanicoInVentaSchema
    );

    const useCase = new UpdateMecanicoInVentaUseCase(
      new PrismaVentaRepository()
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
      deleteMecanicoFromVentaSchema
    );

    const useCase = new DeleteMecanicoFromVentaUseCase(
      new PrismaVentaRepository()
    );

    await useCase.execute(dto);
    return NextResponse.json({ mensaje: "Mecánico eliminado de la venta" });
  } catch (e) {
    return handleApiError(e);
  }
}
