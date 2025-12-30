import { PatchOrdenV2UseCase } from "@/core/application/use-cases/orden-reparacion/patch-orden-v2.use-case";
import { PrismaOrdenReparacionRepository } from "@/core/infrastructure/database/repositories/prisma-orden-reparacion.repository";
import { patchOrdenV2Schema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    const dto = await validateRequest(
      {
        id: params.id,
        ...body,
      },
      patchOrdenV2Schema
    );

    const ordenActualizada = await new PatchOrdenV2UseCase(
      new PrismaOrdenReparacionRepository()
    ).execute(dto);

    return NextResponse.json(ordenActualizada, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
