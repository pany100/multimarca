import { DeleteInformacionGeneralUseCase } from "@/core/application/use-cases/informacion-general/delete-informacion-general.use-case";
import { UpdateInformacionGeneralUseCase } from "@/core/application/use-cases/informacion-general/update-informacion-general.use-case";
import { PrismaInformacionGeneralRepository } from "@/core/infrastructure/database/repositories/prisma-informacion-general.repository";
import { updateInformacionGeneralSchema } from "@/core/infrastructure/validation/schemas/informacion-general.schema";
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
      updateInformacionGeneralSchema
    );
    const result = await new UpdateInformacionGeneralUseCase(
      new PrismaInformacionGeneralRepository()
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
    const result = await new DeleteInformacionGeneralUseCase(
      new PrismaInformacionGeneralRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
