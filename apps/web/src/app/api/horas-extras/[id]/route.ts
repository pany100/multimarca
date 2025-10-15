import { DeleteHoraExtraUseCase } from "@/core/application/use-cases/horas-extras/delete-hora-extra.use-case";
import { GetHoraExtraUseCase } from "@/core/application/use-cases/horas-extras/get-hora-extra.use-case";
import { UpdateHoraExtraUseCase } from "@/core/application/use-cases/horas-extras/update-hora-extra.use-case";
import { PrismaHoraExtraRepository } from "@/core/infrastructure/database/repositories/prisma-hora-extra.repository";
import { updateHoraExtraSchema } from "@/core/infrastructure/validation/schemas/hora-extra.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const result = await new GetHoraExtraUseCase(
      new PrismaHoraExtraRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const dto = await validateRequest({ id, ...body }, updateHoraExtraSchema);
    const result = await new UpdateHoraExtraUseCase(
      new PrismaHoraExtraRepository()
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
    const result = await new DeleteHoraExtraUseCase(
      new PrismaHoraExtraRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
