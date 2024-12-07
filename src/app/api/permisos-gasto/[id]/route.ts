import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { nombre, roles } = await request.json();

    const categoriaGasto = await prisma.categoriaGasto.update({
      where: { id },
      data: {
        nombre,
        roles: {
          set: roles.map((rolId: number) => ({ id: rolId })),
        },
      },
      include: {
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(categoriaGasto);
  } catch (error) {
    console.error("Error al actualizar permiso de gasto:", error);
    return NextResponse.json(
      { error: "Error al actualizar el permiso de gasto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Primero desconectamos todos los roles asociados
    await prisma.categoriaGasto.update({
      where: { id },
      data: {
        roles: {
          set: [], // Esto elimina todas las relaciones con roles
        },
      },
    });

    const categoriaGasto = await prisma.categoriaGasto.findUnique({
      where: { id },
    });

    return NextResponse.json(categoriaGasto);
  } catch (error) {
    console.error("Error al eliminar permiso de gasto:", error);
    return NextResponse.json(
      { error: "Error al eliminar el permiso de gasto" },
      { status: 500 }
    );
  }
}
