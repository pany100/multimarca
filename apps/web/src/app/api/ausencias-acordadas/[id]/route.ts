import { DeleteAusenciaAcordadaUseCase } from "@/core/application/use-cases/ausencias-acordadas/delete-ausencia-acordada.use-case";
import { GetAusenciaAcordadaUseCase } from "@/core/application/use-cases/ausencias-acordadas/get-ausencia-acordada.use-case";
import { UpdateAusenciaAcordadaUseCase } from "@/core/application/use-cases/ausencias-acordadas/update-ausencia-acordada.use-case";
import { PrismaAusenciaProgramadaRepository } from "@/core/infrastructure/database/repositories/prisma-ausencia-programada.repository";
import {
  getAusenciaProgramadaSchema,
  updateAusenciaProgramadaSchema,
} from "@/core/infrastructure/validation/schemas/ausencia.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const dto = await validateRequest({ id }, getAusenciaProgramadaSchema);
    const ausencia = await new GetAusenciaAcordadaUseCase(
      new PrismaAusenciaProgramadaRepository()
    ).execute(dto.id);
    return NextResponse.json(ausencia);
  } catch (error) {
    return handleApiError(error);
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
      {
        id,
        ...body,
      },
      updateAusenciaProgramadaSchema
    );
    const ausencia = await new UpdateAusenciaAcordadaUseCase(
      new PrismaAusenciaProgramadaRepository()
    ).execute(id, dto);
    return NextResponse.json(ausencia);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const dto = await validateRequest({ id }, getAusenciaProgramadaSchema);
    const ausencia = await new DeleteAusenciaAcordadaUseCase(
      new PrismaAusenciaProgramadaRepository()
    ).execute(dto.id);

    return NextResponse.json({
      message: "Ausencia acordada eliminada con éxito",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
