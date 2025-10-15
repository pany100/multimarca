import { DeleteApercibimientoUseCase } from "@/core/application/use-cases/apercibimientos/delete-apercibimiento.use-case";
import { GetApercibimientoUseCase } from "@/core/application/use-cases/apercibimientos/get-apercibimiento.use-case";
import { UpdateApercibimientoUseCase } from "@/core/application/use-cases/apercibimientos/update-apercibimiento.use-case";
import { PrismaApercibimientoRepository } from "@/core/infrastructure/database/repositories/prisma-apercibimiento.repository";
import { updateApercibimientoSchema } from "@/core/infrastructure/validation/schemas/apercibimiento.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const result = await new GetApercibimientoUseCase(
      new PrismaApercibimientoRepository()
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
    const dto = await validateRequest({ id, ...body }, updateApercibimientoSchema);
    const result = await new UpdateApercibimientoUseCase(
      new PrismaApercibimientoRepository()
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
    const result = await new DeleteApercibimientoUseCase(
      new PrismaApercibimientoRepository()
    ).execute(id);
    return NextResponse.json(result);
  } catch (e) {
    return handleApiError(e);
  }
}
