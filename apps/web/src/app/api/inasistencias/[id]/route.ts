import { mapInasistenciaToResponse } from "@/core/application/mapper/empleado-response.mapper";
import { DeleteInasistenciaUseCase } from "@/core/application/use-cases/inasistencias/delete-inasistencia.use-case";
import { GetInasistenciaUseCase } from "@/core/application/use-cases/inasistencias/get-inasistencia.use-case";
import { UpdateInasistenciaUseCase } from "@/core/application/use-cases/inasistencias/update-inasistencia.use-case";
import { PrismaInasistenciaRepository } from "@/core/infrastructure/database/repositories/prisma-inasistencia.repository";
import { updateInasistenciaSchema } from "@/core/infrastructure/validation/schemas/inasistencia.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const result = await new GetInasistenciaUseCase(
      new PrismaInasistenciaRepository()
    ).execute(id);
    if (!result) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(mapInasistenciaToResponse(result));
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
    const dto = await validateRequest(
      { id, ...body },
      updateInasistenciaSchema
    );
    const result = await new UpdateInasistenciaUseCase(
      new PrismaInasistenciaRepository()
    ).execute(dto);
    return NextResponse.json(mapInasistenciaToResponse(result));
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
    const result = await new DeleteInasistenciaUseCase(
      new PrismaInasistenciaRepository()
    ).execute(id);
    return NextResponse.json(mapInasistenciaToResponse(result));
  } catch (e) {
    return handleApiError(e);
  }
}
