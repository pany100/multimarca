import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id, roles } = await request.json();
    const existingGasto = await prisma.categoriaGasto.findUnique({
      where: { id: parseInt(id) },
      include: {
        roles: true,
      },
    });

    if (!existingGasto) {
      return NextResponse.json(
        { error: "No se encontró la categoría de gasto" },
        { status: 404 }
      );
    }

    // Buscar los roles por nombre
    const rolesEncontrados = await prisma.rol.findMany({
      where: {
        id: {
          in: roles,
        },
      },
    });

    if (rolesEncontrados.length !== roles.length) {
      return NextResponse.json(
        { error: "Algunos roles especificados no existen" },
        { status: 400 }
      );
    }
    const categoriaGasto = await prisma.categoriaGasto.update({
      where: { id: parseInt(id) },
      data: {
        roles: {
          set: [], // Primero borramos todos los roles existentes
          connect: rolesEncontrados.map((rol) => ({ id: rol.id })), // Conectamos los nuevos roles
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

    const categoriaGastoConRoles = {
      ...categoriaGasto,
      roles: categoriaGasto.roles.map((rol) => rol.id),
      rolesData: categoriaGasto.roles,
    };

    return NextResponse.json(categoriaGastoConRoles);
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
