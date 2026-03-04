import { PatchOrdenV2UseCase } from "@/core/application/use-cases/orden-reparacion/patch-orden-v2.use-case";
import { PrismaNotificationRepository } from "@/core/infrastructure/database/repositories/prisma-notification.repository";
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

    const repository = new PrismaOrdenReparacionRepository();
    const ordenAntes = await repository.findById(parseInt(dto.id));
    const estadoAnterior = ordenAntes?.estado ?? null;

    const ordenActualizada = await new PatchOrdenV2UseCase(
      repository
    ).execute(dto);

    return NextResponse.json(ordenActualizada, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
