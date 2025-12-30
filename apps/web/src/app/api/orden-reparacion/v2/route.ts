import { prisma } from "@/core/infrastructure/database/prisma";
import { createDraftOrdenSchema } from "@/core/infrastructure/validation/schemas/orden-reparacion.schema";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createDraftOrdenSchema);

    const created = await prisma.ordenReparacion.create({
      data: {
        autoId: dto.autoId,
        kilometros: dto.kilometros ?? null,
        observacionesCliente: dto.observacionesCliente,
        observacionesEntrada: "",
        observacionesSalida: "",
        estado: "Borrador" as any,
        descuento: 0,
        incremento: 0,
        incrementoInterno: 0,
        porcentajeRecargo: 0,
      },
      include: {
        auto: {
          include: {
            owner: true,
          },
        },
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
