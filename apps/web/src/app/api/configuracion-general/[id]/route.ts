import prisma from "@/lib/prisma";
import { handleApiError } from "@/shared/middleware/error-handler.middleware";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const item = await prisma.configuracionGeneral.findUnique({
      where: { id: idNum },
    });

    if (!item) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const { valor } = body;

    if (valor === undefined || valor === null) {
      return NextResponse.json(
        { error: "El valor es requerido" },
        { status: 400 }
      );
    }

    const updated = await prisma.configuracionGeneral.update({
      where: { id: idNum },
      data: { valor: String(valor) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.configuracionGeneral.delete({
      where: { id: idNum },
    });

    return NextResponse.json({ message: "Configuración eliminada con éxito" });
  } catch (error) {
    return handleApiError(error);
  }
}
