import { createAjustePrecioSchema } from "@/core/infrastructure/validation/schemas/ajuste-precio.schema";
import { prisma } from "@/core/infrastructure/database/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const dto = await validateRequest(body, createAjustePrecioSchema);

    const ajuste = await prisma.ajustePrecio.create({
      data: {
        descripcion: dto.descripcion,
        monto: dto.monto,
        tipo: dto.tipo,
        esDescuento: dto.esDescuento,
        esInterno: dto.esInterno,
        orden: dto.orden,
        ordenReparacionId: dto.ordenReparacionId,
        ventaId: dto.ventaId,
        presupuestoId: dto.presupuestoId,
      },
    });

    return NextResponse.json(ajuste, { status: 201 });
  } catch (e) {
    return handleApiError(e);
  }
}
