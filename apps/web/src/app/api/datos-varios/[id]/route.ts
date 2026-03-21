import { DeleteDatosVariosUseCase } from "@/core/application/use-cases/datos-varios/delete-datos-varios.use-case";
import { UpdateDatosVariosUseCase } from "@/core/application/use-cases/datos-varios/update-datos-varios.use-case";
import { PrismaDatosVariosRepository } from "@/core/infrastructure/database/repositories/prisma-datos-varios.repository";
import { updateDatosVariosSchema } from "@/core/infrastructure/validation/schemas/datos-varios.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const dto = await validateRequest({ id, ...body }, updateDatosVariosSchema);
    const result = await new UpdateDatosVariosUseCase(
      new PrismaDatosVariosRepository()
    ).execute(dto);
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
    const id = parseInt(params.id, 10);
    const result = await new DeleteDatosVariosUseCase(
      new PrismaDatosVariosRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
