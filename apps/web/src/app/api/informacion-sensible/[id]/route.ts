import { DeleteInformacionSensibleUseCase } from "@/core/application/use-cases/informacion-sensible/delete-informacion-sensible.use-case";
import { UpdateInformacionSensibleUseCase } from "@/core/application/use-cases/informacion-sensible/update-informacion-sensible.use-case";
import { PrismaInformacionSensibleRepository } from "@/core/infrastructure/database/repositories/prisma-informacion-sensible.repository";
import { updateInformacionSensibleSchema } from "@/core/infrastructure/validation/schemas/informacion-sensible.schema";
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
      updateInformacionSensibleSchema
    );
    const result = await new UpdateInformacionSensibleUseCase(
      new PrismaInformacionSensibleRepository()
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
    const id = parseInt(params.id);
    const result = await new DeleteInformacionSensibleUseCase(
      new PrismaInformacionSensibleRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
