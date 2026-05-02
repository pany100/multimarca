import { recalcularPrecioTotalOrdenDeCompra } from "@/core/application/services/orden-de-compra-recalculo.service";
import {
  deleteAjustePrecioSchema,
  updateAjustePrecioSchema,
} from "@/core/infrastructure/validation/schemas/ajuste-precio.schema";
import { prisma } from "@/core/infrastructure/database/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { validateRequest } from "@/shared/middleware/validation.middleware";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID invalido" }, { status: 400 });
    }

    const ajuste = await prisma.ajustePrecio.findUnique({ where: { id } });
    if (!ajuste) {
      return NextResponse.json(
        { error: "Ajuste de precio no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(ajuste);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const dto = await validateRequest(
      { ...body, id: params.id },
      updateAjustePrecioSchema,
    );

    const updateData: any = {};
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.monto !== undefined) updateData.monto = dto.monto;
    if (dto.tipo !== undefined) updateData.tipo = dto.tipo;
    if (dto.esDescuento !== undefined) updateData.esDescuento = dto.esDescuento;
    if (dto.esInterno !== undefined) updateData.esInterno = dto.esInterno;
    if (dto.orden !== undefined) updateData.orden = dto.orden;

    const ajuste = await prisma.ajustePrecio.update({
      where: { id: dto.id },
      data: updateData,
    });

    if (ajuste.ordenDeCompraId) {
      await recalcularPrecioTotalOrdenDeCompra(ajuste.ordenDeCompraId);
    }

    return NextResponse.json(ajuste);
  } catch (e) {
    return handleApiError(e);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const dto = await validateRequest(
      { id: params.id },
      deleteAjustePrecioSchema,
    );

    const ajusteEliminado = await prisma.ajustePrecio.delete({
      where: { id: dto.id },
    });

    if (ajusteEliminado.ordenDeCompraId) {
      await recalcularPrecioTotalOrdenDeCompra(ajusteEliminado.ordenDeCompraId);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleApiError(e);
  }
}
