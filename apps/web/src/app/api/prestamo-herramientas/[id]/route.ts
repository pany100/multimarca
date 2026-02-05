import { DeletePrestamoHerramientasUseCase } from "@/core/application/use-cases/prestamo-herramientas/delete-prestamo-herramientas.use-case";
import { UpdatePrestamoHerramientasUseCase } from "@/core/application/use-cases/prestamo-herramientas/update-prestamo-herramientas.use-case";
import { PrismaPrestamoHerramientasRepository } from "@/core/infrastructure/database/repositories/prisma-prestamo-herramientas.repository";
import { updatePrestamoHerramientasSchema } from "@/core/infrastructure/validation/schemas/prestamo-herramientas.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const dto = await validateRequest(
      { id, ...body },
      updatePrestamoHerramientasSchema
    );
    const result = await new UpdatePrestamoHerramientasUseCase(
      new PrismaPrestamoHerramientasRepository()
    ).execute({
      ...dto,
      devuelto: dto.devuelto ?? false,
    });
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
    const id = parseInt(params.id);
    const result = await new DeletePrestamoHerramientasUseCase(
      new PrismaPrestamoHerramientasRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
