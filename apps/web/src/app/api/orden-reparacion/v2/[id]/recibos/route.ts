import { AddReciboUseCase } from "@/core/application/use-cases/orden-reparacion/add-recibo.use-case";
import { DeleteReciboUseCase } from "@/core/application/use-cases/orden-reparacion/delete-recibo.use-case";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import {
  addReciboSchema,
  deleteReciboSchema,
} from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const dto = await validateRequest(
      {
        ordenId: params.id,
        ...body,
      },
      addReciboSchema
    );

    const result = await new AddReciboUseCase(
      new PrismaOrdenReparacionRepository()
    ).execute(dto.ordenId, dto.reciboPath);

    return NextResponse.json(
      {
        message: "Recibo agregado correctamente",
        ...result,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const dto = await validateRequest(
      {
        ordenId: params.id,
        ...body,
      },
      deleteReciboSchema
    );

    const result = await new DeleteReciboUseCase(
      new PrismaOrdenReparacionRepository()
    ).execute(dto.ordenId, dto.reciboPath);

    return NextResponse.json(
      {
        message: "Recibo eliminado correctamente",
        ...result,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
