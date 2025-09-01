import { PresupuestoService } from "@/core/application/services/presupuesto.service";
import { DeletePresupuestoUseCase } from "@/core/application/use-cases/presupuesto/delete-presupuesto.use-case";
import { GetPresupuestoUseCase } from "@/core/application/use-cases/presupuesto/get-presupuesto.use-case";
import { UpdatePresupuestoUseCase } from "@/core/application/use-cases/presupuesto/update-presupuesto.use-case";
import { PrismaPresupuestoRepository } from "@/core/infrastructure/database/repositories/prisma-presupuesto.repository";
import {
  getPresupuestoQuerySchema,
  updatePresupuestoSchema,
} from "@/core/infrastructure/validation/schemas/presupuesto.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dto = await validateRequest(
      {
        id: params.id,
      },
      getPresupuestoQuerySchema
    );
    const presupuesto = await new GetPresupuestoUseCase(
      new PrismaPresupuestoRepository()
    ).execute(dto.id);
    return NextResponse.json(presupuesto);
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
      {
        id,
        ...body,
      },
      updatePresupuestoSchema
    );
    const updated = await new UpdatePresupuestoUseCase(
      new PresupuestoService(new PrismaPresupuestoRepository())
    ).execute(dto);

    return NextResponse.json(updated);
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
      getPresupuestoQuerySchema
    );
    await new DeletePresupuestoUseCase(
      new PresupuestoService(new PrismaPresupuestoRepository())
    ).execute(dto.id);

    return NextResponse.json({
      mensaje: "Presupuesto eliminado correctamente",
    });
  } catch (e) {
    return handleApiError(e);
  }
}
